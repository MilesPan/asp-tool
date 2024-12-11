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

interface FunctionBodyInfo {
  startLine: number;
  endLine: number;
  content: string[];
}
// 获取函数体
// 获取函数体
export function getFunctionBody(
  document: TextDocument,
  lineNumber: number
): FunctionBodyInfo | null {
  let openBraces = 0;
  let openParens = 0; // 添加括号计数
  let functionBodyStart = lineNumber;
  let functionBodyEnd = lineNumber;
  const content: string[] = [];

  // 向上查找函数声明的开始
  let currentLine = lineNumber;
  let foundFunctionStart = false;

  while (currentLine >= 0) {
    const line = document.lineAt(currentLine).text;

    // 计算括号的变化
    openParens -= (line.match(/\(/g) || []).length;
    openParens += (line.match(/\)/g) || []).length;

    // 如果找到async关键字且括号已经闭合（或没有括号），说明找到了函数声明的开始
    if (line.match(/\basync\s+(function|[\w$]+\s*=|\()/)) {
      if (openParens <= 0) {
        functionBodyStart = currentLine;
        foundFunctionStart = true;
        break;
      }
    }
    currentLine--;
  }

  if (!foundFunctionStart) {
    return null;
  }

  // 从函数声明开始向下查找函数体
  let foundBodyStart = false;
  for (let i = functionBodyStart; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;
    content.push(line);

    if (!foundBodyStart) {
      if (line.includes("{")) {
        foundBodyStart = true;
        openBraces = 1;
      }
      continue;
    }

    openBraces += (line.match(/{/g) || []).length;
    openBraces -= (line.match(/}/g) || []).length;

    if (openBraces === 0) {
      functionBodyEnd = i;
      break;
    }
  }

  if (!foundBodyStart) {
    return null;
  }

  return {
    startLine: functionBodyStart,
    endLine: functionBodyEnd,
    content,
  };
}

// 检查某一行是否在内部函数中
export function isInInnerFunction(
  line: string,
  innerFunctionBraces: number,
  isFirstLine: boolean // 添加参数标识是否是当前检查的函数的第一行
): { isInner: boolean; bracesChange: number } {
  let bracesChange = 0;

  // 计算花括号变化
  if (line.includes("{")) {
    bracesChange++;
  }
  if (line.includes("}")) {
    bracesChange--;
  }

  // 检查是否是函数声明
  const isNewFunction = line.includes("function") || line.includes("=>");

  // 如果是第一行，不算作内部函数
  // 否则，当前行是函数声明且有开括号，或者已经在内部函数中，就算作内部函数
  const isInner =
    !isFirstLine &&
    ((isNewFunction && line.includes("{")) || innerFunctionBraces > 0);

  return { isInner, bracesChange };
}
