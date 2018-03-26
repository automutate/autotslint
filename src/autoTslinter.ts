import { AutoMutator, ConsoleLogger, FileMutationsApplier, ILogger } from "automutate";

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
 * Creates an AutoMutator to fix TSLint complaints.
 */
export const createAutoTslinter = (settings: IAutoTslintSettings) => {
    const logger: ILogger = settings.logger || new ConsoleLogger();

    return new AutoMutator({
        logger,
        mutationsApplier: new FileMutationsApplier({ logger }),
        mutationsProvider: new TslintMutationsProvider(settings.linter, console),
    });
};
