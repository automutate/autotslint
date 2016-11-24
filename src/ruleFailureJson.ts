export interface IPositionJson {
    character: number;
    line: number;
    position: number;
}

export interface IReplacementJson {
    innerStart: number;
    innerLength: number;
    innerText: string;
}

export interface IFixJson {
    innerRuleName: string;
    innerReplacements: IReplacementJson[];
}

export interface IRuleFailureJson {
    endPosition: IPositionJson;
    failure: string;
    fix: IFixJson;
    name: string;
    ruleName: string;
    startPosition: IPositionJson;
}
