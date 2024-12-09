import { BaseRule, Violation } from './baseRule';
import * as vscode from 'vscode';

export class VForKey extends BaseRule {
    constructor() {
        super('VForKey');
    }
    check(lineText: string, document: vscode.TextDocument, lineNumber: number): Violation[] {
        const violations: Violation[] = [];
        const vForRegex = /v-for\s*=\s*["'][^"']*["']/;
        const keyRegex = /:\s*key\s*=\s*["'][^"']*["']/;

        if (vForRegex.test(lineText) && !keyRegex.test(lineText)) {
            violations.push({
                start: 0,
                end: lineText.length,
                message: 'v-for directive should have a corresponding :key'
            });
        }

        return violations;
    }
}
