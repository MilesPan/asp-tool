import * as vscode from 'vscode';

// 违规信息
export interface Violation {
    start: number;
    end: number;
    message: string;
}

export abstract class BaseRule {
    constructor(public readonly name: string) {}

    // 所有rule需要提供一个check方法，返回一个Violation数组
    abstract check(lineText: string, document: vscode.TextDocument, lineNumber: number): Violation[];
}

