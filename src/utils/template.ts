import { TextDocument } from "vscode";
import * as vscode from "vscode";
// 获取完整的元素
export function getCompleteElement(
  document: TextDocument,
  startLine: number
): string[] {
  const lines: string[] = [];
  let currentLine = startLine;
  let openTags = 0;
  let foundStart = false;
  let targetIndentation: number | null = null;

  // 首先找到当前行的缩进级别
  const currentLineText = document.lineAt(startLine).text;
  const currentIndentation = currentLineText.search(/\S/);

  // 向上查找开始标签
  while (currentLine >= 0 && !foundStart) {
    const line = document.lineAt(currentLine).text;
    const lineIndentation = line.search(/\S/);

    // 如果找到更低或相同缩进级别的行，且包含开始标签
    if (
      lineIndentation <= currentIndentation &&
      line.trim().startsWith("<") &&
      !line.trim().startsWith("</")
    ) {
      foundStart = true;
      targetIndentation = lineIndentation;
      lines.unshift(line);
      openTags = 1; // 重置openTags计数
    }
    currentLine--;
  }

  if (!foundStart) {
    return [currentLineText]; // 如果没找到开始标签，返回当前行
  }

  // 向下查找，直到找到匹配的结束标签
  currentLine = startLine + 1;
  while (currentLine < document.lineCount && openTags > 0) {
    const line = document.lineAt(currentLine).text;
    const lineIndentation = line.search(/\S/);
    const trimmedLine = line.trim();

    // 只处理与目标缩进级别相同或更深的行
    if (lineIndentation >= targetIndentation!) {
      lines.push(line);

      // 计算标签的开合
      if (
        trimmedLine.startsWith("<") &&
        !trimmedLine.startsWith("</") &&
        !trimmedLine.endsWith("/>")
      ) {
        openTags++;
      }
      if (trimmedLine.startsWith("</") || trimmedLine.endsWith("/>")) {
        openTags--;
      }
    } else {
      // 如果遇到更低缩进级别的行，说明已经超出了当前元素的范围
      break;
    }
    currentLine++;
  }

  return lines;
}