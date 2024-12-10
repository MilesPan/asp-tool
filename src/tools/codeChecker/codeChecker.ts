import * as vscode from 'vscode';
import { BaseTool } from '../baseTool';
import { ConfigManager } from '../../core/configManager';
import { BaseRule } from './rules/baseRule';
import { CssShorthand } from './rules/cssShorthand';
import { IfBraces } from './rules/ifBraces';
import { VForKey } from './rules/vForKey';
import { NoUseCode } from './rules/noUseCode';
import { ImgAlt } from './rules/imgAlt';

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
        this.rules.push(new NoUseCode());
        this.rules.push(new ImgAlt());
    }

    public async run(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const diagnostics: vscode.Diagnostic[] = [];
        const messages: string[] = [];

        this.clearDecorations(editor);

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            for (const rule of this.rules) {
                const violations = rule.check(line.text, document, i);
                for (const violation of violations) {
                    const range = new vscode.Range(i, violation.start, i, violation.end);
                    const diagnostic = new vscode.Diagnostic(range, violation.message, violation.type || vscode.DiagnosticSeverity.Warning);
                    diagnostics.push(diagnostic);
                    messages.push(violation.message);
                }
            }
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
        
        if (diagnostics.length > 0) {
            this.applyDecorations(editor, diagnostics, messages);
        }
    }

    public dispose() {
        super.dispose();
        this.diagnosticCollection.dispose();
    }
}

