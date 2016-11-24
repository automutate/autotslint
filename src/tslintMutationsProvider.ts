import { IMutations } from "automutate/lib/mutation";
import { ITextSwapMutation } from "automutate/lib/mutators/textSwapMutator";
import { IFileMutations, IMutationsProvider, IMutationsWave } from "automutate/lib/mutationsProvider";
import * as stream from "stream";
import { Runner as TslintRunner } from "tslint/lib/runner";
import { IReplacementJson, IRuleFailureJson } from "./ruleFailureJson";

/**
 * Settings to run waves of TSLint.
 */
export interface ITslintRunnerSettings /* overrides TSLint.IRunnerOptions */ {
    /**
     * Path to a configuration file.
     */
    config?: string;

    /**
     * Exclude globs from path expansion.
     */
    exclude?: string | string[];

    /**
     * File paths to lint.
     */
    files?: string[];

    /**
     * tsconfig.json file.
     */
    project?: string;

    /**
     * Rules directory paths.
     */
    rulesDirectory?: string | string[];

    /**
     * Whether to enable type checking when linting a project.
     */
    typeCheck?: boolean;
}

/**
 * Provides waves of TSLint failure fixes as file mutations.
 */
export class TslintMutationsProvider implements IMutationsProvider {
    /**
     * Settings to run TSLint.
     */
    private readonly settings: ITslintRunnerSettings;

    /**
     * Intermediary stream to hold lint results.
     */
    private readonly stream: stream.PassThrough;

    /**
     * Runs a wave of TSLint.
     */
    private readonly runner: TslintRunner;

    /**
     * Initializes a new instance of the TslintMutationsProvider class.
     * 
     * @param settings   Settings to run TSLint.
     */
    public constructor(settings: ITslintRunnerSettings) {
        this.settings = settings;
        this.stream = new stream.PassThrough();
        this.runner = new TslintRunner(
            Object.assign(
                {} as any,
                settings,
                {
                    format: "json"
                }),
            this.stream);
    }

    /**
     * @returns A Promise for a wave of file mutations.
     */
    public async provide(): Promise<IMutationsWave> {
        return new Promise((resolve, reject): void => {
            this.runner.run((): void => {
                resolve({
                    fileMutations: this.groupFailuresToFileMutations(
                        (JSON.parse(this.stream.read().toString()) as IRuleFailureJson[])
                            .filter((ruleFailure: IRuleFailureJson): boolean => !!ruleFailure.fix))
                });
            });
        });
    }

    /**
     * Converts a raw list of TSLint failures to grouped file mutations.
     * 
     * @param ruleFailures   Raw list of TSLint failures.
     * @returns Grouped file mutations.
     */
    private groupFailuresToFileMutations(ruleFailures: IRuleFailureJson[]): IFileMutations | undefined {
        if (!ruleFailures.length) {
            return undefined;
        }

        const fileMutations: IFileMutations = {};

        for (const ruleFailure of ruleFailures) {
            if (!fileMutations[ruleFailure.name]) {
                fileMutations[ruleFailure.name] = [];
            }

            fileMutations[ruleFailure.name].push(
                this.convertFailureToMutation(ruleFailure));
        }

        return fileMutations;
    }

    /**
     * Converts a raw TSLint failure to a file mutation.
     * 
     * @param ruleFailure   Raw TSLint failure.
     * @returns Converted file mutation.
     */
    private convertFailureToMutation(ruleFailure: IRuleFailureJson): IMutations {
        let begin = Infinity;
        let end = -Infinity;

        for (const innerReplacement of ruleFailure.fix.innerReplacements) {
            begin = Math.min(begin, innerReplacement.innerStart);
            end = Math.max(end, innerReplacement.innerStart + innerReplacement.innerLength);
        }

        return {
            mutations: ruleFailure.fix.innerReplacements
                .map((replacement: IReplacementJson): ITextSwapMutation => ({
                    insertion: replacement.innerText,
                    range: {
                        begin: replacement.innerStart,
                        end: replacement.innerStart + replacement.innerLength
                    },
                    type: "text-swap"
                })),
            range: { begin, end },
            type: "multiple"
        };
    }
}
