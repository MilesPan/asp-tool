import { BaseRule, Violation } from './baseRule';
import * as vscode from 'vscode';

export class ExampleRule extends BaseRule {
    constructor() {
        super('Example Rule');
    }

    check(lineText: string, document: vscode.TextDocument, lineNumber: number): Violation[] {
        const violations: Violation[] = [];
        if (lineText.includes('TODO')) {
            violations.push({
                start: lineText.indexOf('TODO'),
                end: lineText.indexOf('TODO') + 4,
                message: 'TODO found. Consider resolving this before committing.'
            });
        }
        return violations;
    }
}

