import * as vscode from 'vscode';

export class ConfigManager {
    private CONFIG_NAME = 'asp-tools';
    constructor(private context: vscode.ExtensionContext) {}

    public get<T>(section: string, defaultValue: T): T {
        return vscode.workspace.getConfiguration(this.CONFIG_NAME).get(section, defaultValue);
    }

    public async update<T>(section: string, value: T): Promise<void> {
        await vscode.workspace.getConfiguration(this.CONFIG_NAME).update(section, value, vscode.ConfigurationTarget.Global);
    }

    public getWorkspaceState<T>(key: string, defaultValue: T): T {
        return this.context.workspaceState.get(key, defaultValue);
    }

    public setWorkspaceState<T>(key: string, value: T): Thenable<void> {
        return this.context.workspaceState.update(key, value);
    }
}

