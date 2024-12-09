import * as vscode from 'vscode';
import { ConfigManager } from '../core/configManager';

export abstract class BaseTool {
    constructor(
        public readonly name: string,
        protected configManager: ConfigManager,
        public readonly activationEvents: string[]
    ) {}

    abstract run(): Promise<void>;
    
    // 新方法：设置激活事件
    public setActivationEvents(context: vscode.ExtensionContext): void {
        for (const event of this.activationEvents) {
            if (event.startsWith('onLanguage:')) {
                const language = event.split(':')[1];
                context.subscriptions.push(
                    vscode.workspace.onDidChangeTextDocument((e) => {
                        if (e.document.languageId === language) {
                            console.log('onDidChangeTextDocument', e.document.languageId, language)
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
}
