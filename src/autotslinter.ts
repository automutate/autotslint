import { AutoMutator } from "automutate/lib/automutator";
import { ILocalFileSettings } from "automutate/lib/fileProviders/localFileProvider";
import { ConsoleLogger } from "automutate/lib/loggers/consoleLogger";
import { FileMutationsApplier } from "automutate/lib/mutationsAppliers/fileMutationsApplier";

import { TslintMutationsProvider } from "./tslintMutationsProvider";

/**
 * Settings to run AutoTslint.
 */
export interface IAutoTslintSettings {
    /**
     * Settings to run waves of TSLint.
     */
    linter: ITslintRunnerSettings;

    /**
     * Settings for manipulating local files.
     */
    files?: ILocalFileSettings;
}

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
 * Runs waves of file mutations to fix linting complaints.
 */
export class AutoTslinter extends AutoMutator {
    /**
     * Initializes a new instance of the AutoTslinter class.
     * 
     * @param settings   Settings to run AutoTslint.
     */
    public constructor(settings: IAutoTslintSettings) {
        const logger: ConsoleLogger = new ConsoleLogger();

        super(
            new FileMutationsApplier(logger, settings.files),
            new TslintMutationsProvider(settings.linter),
            logger);
    }
}
