import { TextDocument } from "vscode";

// 判断当前行是否在template标签内
export function isInTemplate(
  document: TextDocument,
  lineNumber: number
): boolean {
  let templateCount = 0;
  let currentLine = lineNumber;

  // 向上查找，统计template标签
  while (currentLine >= 0) {
    const line = document.lineAt(currentLine).text;
    // 计算当前行中的template开闭情况
    const closeMatches = line.match(/<\/template>/g);
    const openMatches = line.match(/<template[^>]*>/g);

    if (closeMatches) {
      templateCount -= closeMatches.length;
    }
    if (openMatches) {
      templateCount += openMatches.length;
    }

    currentLine--;
  }

  // templateCount > 0 表示在template标签内
  return templateCount > 0;
}

// 判断当前行是否在script标签内
export function isInScript(
  document: TextDocument,
  lineNumber: number
): boolean {
  let currentLine = lineNumber;

  // 向上查找最近的script标签
  while (currentLine >= 0) {
    const line = document.lineAt(currentLine).text;
    if (line.match(/<\/script>/)) {
      return false; // 遇到闭合标签，说明不在script内
    }
    if (line.match(/<script[^>]*>/)) {
      return true; // 遇到开始标签，说明在script内
    }
    currentLine--;
  }

  return false;
}

// 判断当前行是否在style标签内
export function isInStyle(document: TextDocument, lineNumber: number): boolean {
  let currentLine = lineNumber;

  // 向上查找最近的style标签
  while (currentLine >= 0) {
    const line = document.lineAt(currentLine).text;
    if (line.match(/<\/style>/)) {
      return false; // 遇到闭合标签，说明不在style内
    }
    if (line.match(/<style[^>]*>/)) {
      return true; // 遇到开始标签，说明在style内
    }
    currentLine--;
  }

  return false;
}
