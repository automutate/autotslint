import { TestsFactory } from "automutate-tests/lib/testsFactory";
import * as fs from "fs";

import { TslintMutationsProvider } from "../lib/tslintMutationsProvider";

const testsFactory = new TestsFactory(
    (fileName: string, settingsFileName: string) => {
        const config = JSON.parse(fs.readFileSync(settingsFileName).toString());

        return new TslintMutationsProvider({
            ...config,
            files: [fileName]
        });
    },
    {
        actual: "actual.ts",
        expected: "expected.ts",
        original: "original.ts",
        settings: "tslint.json"
    });

testsFactory.describe(__dirname);
