import { IMutationsProvider, IMutationsWave } from "automutate/lib/mutationsProvider";
import * as stream from "stream";
import { Runner as TslintRunner } from "tslint/lib/runner";
import { IRuleFailureJson } from "tslint/lib/language/rule/rule";

import { TslintFixesTransformer } from "./tslintFixesTransformer";

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
     * Transforms TSLint Fix objects to automutate mutations.
     */
    private readonly fixesTransformer: TslintFixesTransformer = new TslintFixesTransformer();

    /**
     * Intermediary stream to hold lint results.
     */
    private readonly stream: stream.PassThrough;

    /**
     * Settings to run TSLint.
     */
    private readonly settings: ITslintRunnerSettings;

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
                    fix: true,
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
                const results: Buffer | null = this.stream.read();
                
                if (!results) {
                    resolve({});
                    return;
                }

                resolve({
                    fileMutations: this.fixesTransformer.groupFailuresToFileMutations(
                        (JSON.parse(results.toString()) as IRuleFailureJson[])
                            .filter((ruleFailure: IRuleFailureJson): boolean => !!ruleFailure.fix))
                });
            });
        });
    }
}
