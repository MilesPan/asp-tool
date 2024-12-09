import * as vscode from 'vscode';
import { ConfigManager } from './core/configManager';
import { ToolManager } from './core/toolManager';

export function activate(context: vscode.ExtensionContext) {
	const configManager = new ConfigManager(context);
	const toolManager = new ToolManager(configManager, context);
	
	// 将所有需要清理的资源添加到 subscriptions 中
	context.subscriptions.push(toolManager);
	
	// 初始化工具
	toolManager.registerAllTools();
}

export function deactivate() {
}
