import { IMutationsProvider, IMutationsWave } from "automutate";
import { IRuleFailureJson } from "tslint/lib/language/rule/rule";
import { Options, run, Status } from "tslint/lib/runner";
import { groupFailuresToFileMutations } from "./tslintFixesTransformer";

const defaultOptions = {
    exclude: [] as string[],
    files: [],
};

/**
 * Settings to run waves of TSLint.
 */
export interface ITslintRunnerSettings /* overrides TSLint.IRunnerOptions */ {
    /**
     * Path to a configuration file.
     */
    config: string;

    /**
     * Exclude globs from path expansion.
     */
    exclude?: string[];

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
     * Initializes a new instance of the TslintMutationsProvider class.
     *
     * ...
     */
    public constructor(
        private readonly lintOptions: Partial<Options>,
        private readonly logger: typeof console,
    ) { }

    /**
     * Provides the next wave of file mutations.
     *
     * @returns Promise for a wave of file mutations.
     */
    public async provide(): Promise<IMutationsWave> {
        const settings: Options = {
            ...defaultOptions,
            ...this.lintOptions,
            // TSLint will always print suggested fixes.
            // This just stops it from being applied to the original files.
            fix: false,
            format: "json",
        };

        let loggedErrors = "";
        let loggedData = "";
        const lintLogger = {
            error: (data: string | Buffer): void => {
                loggedErrors += data.toString();
            },
            log: (data: string | Buffer): void => {
                loggedData += data.toString();
            },
        };

        const result = await run(settings, lintLogger);
        if (result === Status.FatalError) {
            this.logger.error(loggedErrors);
            return {};
        }

        const ruleFailures = JSON.parse(loggedData) as IRuleFailureJson[];

        return {
            fileMutations: groupFailuresToFileMutations(ruleFailures),
        };
    }
}
