import * as vscode from 'vscode';

export interface Violation {
    start: number;
    end: number;
    message: string;
}

export abstract class BaseRule {
    constructor(public readonly name: string) {}

    abstract check(lineText: string, document: vscode.TextDocument, lineNumber: number): Violation[];
}

