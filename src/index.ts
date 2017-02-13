import { AutoMutator } from "automutate/lib/automutator";
import { ILogger } from "automutate/lib/logger";
import { ConsoleLogger } from "automutate/lib/loggers/consoleLogger";
import { FileMutationsApplier } from "automutate/lib/mutationsAppliers/fileMutationsApplier";
import * as path from "path";

import { ITslintRunnerSettings, TslintMutationsProvider } from "./tslintMutationsProvider";

/**
 * Settings to run AutoTslint.
 */
export interface IAutoTslintSettings {
    /**
     * Settings to run waves of TSLint.
     */
    linter: ITslintRunnerSettings;

    /**
     * Generates output messages for significant operations.
     */
    logger?: ILogger;
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
        const logger: ILogger = settings.logger || new ConsoleLogger();

        super(
            new FileMutationsApplier(
                logger,
                {
                    mutatorDirectories: [
                        path.join(__dirname, "../node_modules/autotslint/src/mutators")
                    ]
                }),
            new TslintMutationsProvider(settings.linter),
            logger);
    }
}
