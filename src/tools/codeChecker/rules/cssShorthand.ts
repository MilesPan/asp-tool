import { BaseRule , Violation } from './baseRule';
import * as vscode from 'vscode';

export class CssShorthand extends BaseRule {
    constructor() {
        super('CssShorthand');
    }
    check(lineText: string, document: vscode.TextDocument, lineNumber: number): Violation[] {
        const violations: Violation[] = [];
        const marginRegex = /margin-(top|right|bottom|left):\s*(\S+);/;
        const paddingRegex = /padding-(top|right|bottom|left):\s*(\S+);/;

        if (marginRegex.test(lineText) || paddingRegex.test(lineText)) {
            violations.push({
                start: 0,
                end: lineText.length,
                message: 'Consider using shorthand properties for margin and padding'
            });
        }

        return violations;
    }
}

