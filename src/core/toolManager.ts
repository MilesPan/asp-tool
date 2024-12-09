import * as vscode from 'vscode';
import { BaseTool } from '../tools/baseTool';
import { ConfigManager } from './configManager';
import { CodeChecker } from '../tools/codeChecker/codeChecker';

export class ToolManager implements vscode.Disposable {
    private tools: BaseTool[] = [];

    constructor(private configManager: ConfigManager, private context: vscode.ExtensionContext) {}

    public registerAllTools() {
        this.registerTool(new CodeChecker(this.configManager));
        // 在这里注册其他工具
    }

    public registerTool(tool: BaseTool) {
        this.tools.push(tool);
        tool.setActivationEvents(this.context);
    }

    public getToolNames(): string[] {
        return this.tools.map(tool => tool.name);
    }

    public async runTool(toolName: string) {
        const tool = this.tools.find(tool => tool.name === toolName);
        if (tool) {
            await tool.run();
        } else {
            vscode.window.showErrorMessage(`Tool "${toolName}" not found.`);
        }
    }

    public dispose() {
        // 清理所有工具
        for (const tool of this.tools) {
            if ('dispose' in tool) {
                (tool as any).dispose();
            }
        }
    }
}

