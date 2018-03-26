import { IFileMutations, IMutation, IMutations, ITextSwapMutation } from "automutate";
import { IRuleFailureJson, ReplacementJson } from "tslint/lib/language/rule/rule";

/**
 * Converts a raw TSLint failure to a file mutation.
 *
 * @param ruleFailure   Raw TSLint failure.
 * @returns Converted file mutation.
 */
const convertFailureToMutations = (ruleFailure: IRuleFailureJson | undefined): IMutation | IMutations | undefined => {
    if (!ruleFailure || !ruleFailure.fix) {
        return undefined;
    }

    let begin = Infinity;
    let end = -Infinity;

    const originalFixes = ruleFailure.fix instanceof Array
        ? ruleFailure.fix
        : [ruleFailure.fix];

    const mutations = originalFixes
        .map((replacement: ReplacementJson): ITextSwapMutation => {
            const replacementBegin = replacement.innerStart;
            const replacementEnd = replacementBegin + replacement.innerLength;

            begin = Math.min(begin, replacementBegin);
            end = Math.max(end, replacementEnd);

            return {
                insertion: replacement.innerText,
                range: {
                    begin: replacementBegin,
                    end: replacementEnd,
                },
                type: "text-swap",
            };
        });

    if (mutations.length === 1) {
        return mutations[0];
    }

    return {
        mutations,
        range: { begin, end },
        type: "multiple",
    };
};

/**
 * Converts a raw list of TSLint failures to grouped file mutations.
 *
 * @param ruleFailures   Raw list of TSLint failures.
 * @returns Grouped file mutations.
 */
export const groupFailuresToFileMutations = (ruleFailures: IRuleFailureJson[]): IFileMutations | undefined => {
    if (ruleFailures.length === 0) {
        return undefined;
    }

    const fileMutations: IFileMutations = {};

    for (const ruleFailure of ruleFailures) {
        if (!fileMutations[ruleFailure.name]) {
            fileMutations[ruleFailure.name] = [];
        }

        const mutation: IMutation | undefined = convertFailureToMutations(ruleFailure);
        if (mutation) {
            fileMutations[ruleFailure.name].push(mutation);
        }
    }

    return fileMutations;
};
