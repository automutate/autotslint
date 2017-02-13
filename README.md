# AutoTSLint

Applies fix suggestions reported by [TSLint](https://github.com/palantir/tslint), accounting for file conflicts and multiple waves of fixes.

## CLI Usage

```cmd
npm install autotslint
autotslint [files...]
```

## Structure

This project uses [automutate](https://github.com/automutate/automutate) to take in waves of [TSLint](https://github.com/palantir/tslint) fix suggestions for rule violations, and fixes them. Running via the CLI is done by [autotslint-cli](https://github.com/automutate/autotslint-cli).

### Code Usage

```typescript
import { AutoTslinter } from "autotslint/lib/index";

const autoTslinter = new AutoTslinter({
    linter: {
        config: argv.c,
        exclude: argv.exclude,
        files: argv._,
        project: argv.project,
        rulesDirectory: argv.r,
        typeCheck: argv["type-check"]
    }
});
```
