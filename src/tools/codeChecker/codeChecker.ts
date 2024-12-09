import * as vscode from 'vscode';
import { BaseTool } from '../baseTool';
import { ConfigManager } from '../../core/configManager';
import { BaseRule } from './rules/baseRule';
import { CssShorthand } from './rules/cssShorthand';
import { IfBraces } from './rules/ifBraces';
import { VForKey } from './rules/vForKey';

export class CodeChecker extends BaseTool {
    private rules: BaseRule[] = [];
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(configManager: ConfigManager) {
        super('Code Checker', configManager, ['onLanguage:javascript', 'onLanguage:typescript', 'onStartupFinished', 'onLanguage:vue']);
        this.initializeRules();
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('codeChecker');
    }

    private initializeRules() {
        this.rules.push(new CssShorthand());
        this.rules.push(new IfBraces());
        this.rules.push(new VForKey());
        // 在这里添加更多规则
    }

    public async run(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const diagnostics: vscode.Diagnostic[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            for (const rule of this.rules) {
                const violations = rule.check(line.text, document, i);
                for (const violation of violations) {
                    const range = new vscode.Range(i, violation.start, i, violation.end);
                    const diagnostic = new vscode.Diagnostic(range, violation.message, vscode.DiagnosticSeverity.Warning);
                    diagnostics.push(diagnostic);
                }
            }
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public dispose() {
        this.diagnosticCollection.dispose();
    }
}

