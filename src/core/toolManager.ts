import * as vscode from 'vscode';
import { BaseTool } from '../tools/baseTool';
import { ConfigManager } from './configManager';
import { CodeChecker } from '../tools/codeChecker/codeChecker';

export class ToolManager {
    private tools: Map<string, BaseTool> = new Map();

    constructor(private configManager: ConfigManager, private context: vscode.ExtensionContext) {}

    public registerAllTools() {
        this.registerTool(new CodeChecker(this.configManager));
        // 在这里注册其他工具
    }

    public registerTool(tool: BaseTool) {
        this.tools.set(tool.name, tool);
        tool.setActivationEvents(this.context);
    }

    public getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }

    public async runTool(toolName: string) {
        const tool = this.tools.get(toolName);
        if (tool) {
            await tool.run();
        } else {
            vscode.window.showErrorMessage(`Tool "${toolName}" not found.`);
        }
    }
}

