import { Mutator } from "automutate/lib/mutator";
import * as ts from "typescript";

/**
 * Generates mutations from TSLint rule failures using TypeScript AST nodes.
 */
export abstract class TsAstMutator extends Mutator {
    /**
     * The file's original AST.
     */
    private originalTree: ts.SourceFile;

    /**
     * Initializes a new instance of the Mutator class.
     *
     * @param originalFileContents   Original contents of the file.
     */
    constructor(originalFileContents: string) {
        super(originalFileContents);

        this.originalTree = ts.createSourceFile("autolinted.ts", originalFileContents, ts.ScriptTarget.Latest);
    }

    /**
     * @returns The file's original AST.
     */
    protected getOriginalTree(): ts.SourceFile {
        return this.originalTree;
    }
}
