import { IMutation, IMutations } from "automutate/lib/mutation";
import { ITextSwapMutation } from "automutate/lib/mutators/textSwapMutator";
import { IFileMutations } from "automutate/lib/mutationsProvider";
import { IRuleFailureJson, Replacement } from "tslint/lib/language/rule/rule";

/**
 * Transforms TSLint Fix objects to automutate mutations.
 */
export class TslintFixesTransformer {
    /**
     * Converts a raw list of TSLint failures to grouped file mutations.
     * 
     * @param ruleFailures   Raw list of TSLint failures.
     * @returns Grouped file mutations.
     */
    public groupFailuresToFileMutations(ruleFailures: IRuleFailureJson[]): IFileMutations | undefined {
        if (!ruleFailures.length) {
            return undefined;
        }

        const fileMutations: IFileMutations = {};

        for (const ruleFailure of ruleFailures) {
            if (!fileMutations[ruleFailure.name]) {
                fileMutations[ruleFailure.name] = [];
            }

            const mutation: IMutation | undefined = this.convertFailureToMutation(ruleFailure);

            if (mutation) {
                fileMutations[ruleFailure.name].push(mutation);
            }
        }

        return fileMutations;
    }

    /**
     * Converts a raw TSLint failure to a file mutation.
     * 
     * @param ruleFailure   Raw TSLint failure.
     * @returns Converted file mutation.
     */
    private convertFailureToMutation(ruleFailure: IRuleFailureJson | undefined): IMutation | undefined {
        if (!ruleFailure || !ruleFailure.fix) {
            return undefined;
        }

        let begin = Infinity;
        let end = -Infinity;

        const mutations = ruleFailure.fix.replacements
            .map((replacement: Replacement): ITextSwapMutation => {
                const replacementBegin = replacement.start;
                const replacementEnd = replacementBegin + replacement.length;

                begin = Math.min(begin, replacementBegin);
                end = Math.max(end, replacementEnd);

                return {
                    insertion: replacement.text,
                    range: {
                        begin: replacementBegin,
                        end: replacementEnd
                    },
                    type: "text-swap"
                };
            });

        if (mutations.length === 0) {
            return mutations[0];
        }

        return {
            mutations,
            range: { begin, end },
            type: "multiple"
        } as IMutations;
    }
}
