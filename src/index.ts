import { AutoTslinter, IAutoTslintSettings } from "./autotslinter";

(async (options: IAutoTslintSettings): Promise<void> => {
    await new AutoTslinter(options)
        .run()
        .catch((error: Error): void => console.log("Error:", error));
})({
    linter: {
        files: ["test/before.ts"]
    }
});
