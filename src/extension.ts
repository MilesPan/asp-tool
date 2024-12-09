import * as vscode from 'vscode';
import { ToolManager } from './core/toolManager';
import { ConfigManager } from './core/configManager';
export function activate(context: vscode.ExtensionContext) {
	const configManager = new ConfigManager(context);
	const toolManager = new ToolManager(configManager, context);
	context.subscriptions.push(vscode.commands.registerCommand('asp-tools.runTool', async () => {
		// const toolsNames = 
		const selectedTool = await vscode.window.showQuickPick([], {
			placeHolder: '选择工具'
		})
		if(!selectedTool) return;

	}));
}
export function deactivate() {}
