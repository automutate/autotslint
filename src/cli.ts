import * as fs from "fs";
import * as optimist from "optimist";
import * as path from "path";

import { AutoTslinter } from "./index";

/**
 * CLI result status code, as 0 (success) or 1 (failure).
 */
export type AutoTSLintCliResult = 0 | 1;

/**
 * Runs AutoTSLint by parsing command-line arguments.
 * 
 * @returns A Promise for the CLI result status code.
 */
export function cli(): Promise<AutoTSLintCliResult> {
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
            "type-check": {
                describe: "enable type checking when linting a project",
                type: "boolean",
            },
            v: {
                alias: "version",
                describe: "current version",
                type: "boolean",
            },
        });
    const argv: any = processed.argv;

    if (argv.help || (!argv._.length && !argv.c)) {
        console.log(processed.help());
        console.log("See https://github.com/automutate/autotslint");
        return Promise.resolve(0);
    }

    if (argv.version) {
        const packagePath: string = path.join(__dirname, "../package.json");
        console.log(JSON.parse(fs.readFileSync(packagePath).toString()).version);
        return Promise.resolve(0);
    }

    const autoTslinter: AutoTslinter = new AutoTslinter({
        linter: {
            config: argv.c,
            exclude: argv.exclude,
            files: argv._,
            project: argv.project,
            rulesDirectory: argv.r,
            typeCheck: argv["type-check"]
        }
    });

    return autoTslinter
        .run()
        .then((): number => 0)
        .catch((error: Error): number => {
            console.error("Error:", error);
            return 1;
        });
}
