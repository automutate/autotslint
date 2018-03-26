import * as fs from "fs";
import * as optimist from "optimist";
import * as path from "path";

import { createAutoTslinter } from "./autoTslinter";

// tslint:disable no-console no-unsafe-any

/**
 * CLI result status code, as 0 (success) or 1 (failure).
 */
export enum AutoTSLintCliResult {
    Failure = 1,
    Success = 0,
}

/**
 * Runs AutoTSLint by parsing command-line arguments.
 *
 * @returns Promise for the CLI result status code.
 */
export const cli = async (): Promise<AutoTSLintCliResult> => {
    const processed = optimist
        .usage("Usage: $0 [options] file ...")
        .options({
            c: {
                alias: "config",
                describe: "configuration file",
                type: "string",
            },
            e: {
                alias: "exclude",
                describe: "exclude globs from path expansion",
                type: "string",
            },
            h: {
                alias: "help",
                describe: "display detailed help",
                type: "boolean",
            },
            project: {
                describe: "tsconfig.json file",
                type: "string",
            },
            r: {
                alias: "rules-dir",
                describe: "rules directory",
                type: "string",
            },
            v: {
                alias: "version",
                describe: "current version",
                type: "boolean",
            },
        });

    if (processed.argv.help || (!processed.argv._.length && !processed.argv.c)) {
        console.log(processed.help());
        console.log("See https://github.com/automutate/autotslint");

        return Promise.resolve(AutoTSLintCliResult.Success);
    }

    if (processed.argv.version) {
        const packagePath: string = path.join(__dirname, "../package.json");
        console.log(JSON.parse(fs.readFileSync(packagePath).toString()).version);

        return Promise.resolve(AutoTSLintCliResult.Success);
    }

    const autoTslinter = createAutoTslinter({
        linter: {
            config: processed.argv.c,
            exclude: processed.argv.exclude === undefined
                ? []
                : processed.argv.exclude,
            files: processed.argv._,
            project: processed.argv.project,
            rulesDirectory: processed.argv.r,
        },
    });

    try {
        await autoTslinter.run();
        return AutoTSLintCliResult.Success;
    } catch (error) {
        console.error("Error:", error);
        return AutoTSLintCliResult.Failure;
    }
};
