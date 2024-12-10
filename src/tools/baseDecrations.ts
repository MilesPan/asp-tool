import * as vscode from 'vscode';

export class BaseDecrations {
    static Warning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 220, 69, 0.15)', // 黄色警告背景，半透明
        isWholeLine: true,
        after: {
            margin: '0 0 0 1em', // 在行尾添加间距
            color: 'rgba(255, 255, 255, 0.5)' // 浅色提示文字
        }
    });

    static Danger: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.15)', // 红色危险背景，半透明
        isWholeLine: true,
        after: {
            margin: '0 0 0 1em', // 在行尾添加间距
            color: 'rgba(255, 255, 255, 0.5)' // 浅色提示文字
        }
    });

    static Success: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 0, 0.15)', // 绿色成功背景，半透明
        isWholeLine: true,
        after: {
            margin: '0 0 0 1em', // 在行尾添加间距
            color: 'rgba(255, 255, 255, 0.5)' // 浅色提示文字
        }
    });

    static Info: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 0, 255, 0.15)', // 蓝色信息背景，半透明
        isWholeLine: true,
        after: {
            margin: '0 0 0 1em', // 在行尾添加间距
            color: 'rgba(255, 255, 255, 0.5)' // 浅色提示文字
        }
    });
}