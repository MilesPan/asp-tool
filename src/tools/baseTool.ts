import * as vscode from 'vscode';
import { ConfigManager } from '../core/configManager';
import { BaseDecrations } from './baseDecrations';

export abstract class BaseTool {
    protected decorationType: vscode.TextEditorDecorationType;
    
    constructor(
        public readonly name: string,
        protected configManager: ConfigManager,
        public readonly activationEvents: string[]
    ) {
        // 创建装饰类型
        this.decorationType = BaseDecrations.Warning;
    }

    abstract run(): Promise<void>;

    // 新增：应用装饰和诊断信息的方法
    protected applyDecorations(
        editor: vscode.TextEditor,
        diagnostics: vscode.Diagnostic[],
        messages: string[]
    ): void {
        const decorations: vscode.DecorationOptions[] = diagnostics.map((diagnostic, index) => ({
            range: diagnostic.range,
            renderOptions: {
                after: {
                    contentText: messages[index] || diagnostic.message
                }
            }
        }));

        editor.setDecorations(this.decorationType, decorations);
    }

    // 清除装饰
    protected clearDecorations(editor: vscode.TextEditor): void {
        editor.setDecorations(this.decorationType, []);
    }
    
    public setActivationEvents(context: vscode.ExtensionContext): void {
        for (const event of this.activationEvents) {
            if (event.startsWith('onLanguage:')) {
                const language = event.split(':')[1];
                context.subscriptions.push(
                    vscode.workspace.onDidChangeTextDocument((e) => {
                        if (e.document.languageId === language) {
                            this.run();
                        }
                    })
                );
            } else if (event === 'onStartupFinished') {
                this.run();
            }
            // 可以根据需要添加更多类型的事件
        }
    }

    // 在类销毁时清理装饰类型
    public dispose(): void {
        this.decorationType.dispose();
    }
}
