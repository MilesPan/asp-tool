import { BaseRule, Violation } from "./baseRule";
import * as vscode from "vscode";

export class IfBraces extends BaseRule {
  constructor() {
    super("IfBraces");
  }

  check(
    lineText: string,
    document: vscode.TextDocument,
    lineNumber: number
  ): Violation[] {
    const violations: Violation[] = [];

    // 如果不是if语句的开始，直接返回
    if (!lineText.trim().startsWith("if")) {
      return violations;
    }

    // 获取完整的if语句（可能跨多行）
    const { conditionEndLine, conditionEndChar } = this.findConditionEnd(
      document,
      lineNumber
    );
    if (conditionEndLine === -1) {
      return violations; // 找不到完整的条件，返回
    }
    // 检查条件后的代码
    if (conditionEndLine === lineNumber) {
      // 条件在同一行结束
      const currentLine = document.lineAt(conditionEndLine).text;
      const afterCondition = currentLine.substring(conditionEndChar + 1).trim();

      if (afterCondition !== "" && !afterCondition.startsWith("{")) {
        violations.push(this.createViolation(lineText));
        return violations;
      } else {
        return violations;
      }
    }
    // 检查下一行
    if (conditionEndLine + 1 < document.lineCount) {
      const endPreLine = document.lineAt(conditionEndLine).text.trim();
      const nextLine = document.lineAt(conditionEndLine + 1).text.trim();
      if (
        (endPreLine !== "" && endPreLine.endsWith("{")) ||
        (nextLine !== "" && nextLine.startsWith("{"))
      ) {
        return violations;
      }
      violations.push(this.createViolation(lineText));
    }

    return violations;
  }

  private findConditionEnd(
    document: vscode.TextDocument,
    startLine: number
  ): { conditionEndLine: number; conditionEndChar: number } {
    let openParens = 0;
    let foundFirstParen = false;

    for (let lineNum = startLine; lineNum < document.lineCount; lineNum++) {
      const line = document.lineAt(lineNum).text;

      for (let charNum = 0; charNum < line.length; charNum++) {
        const char = line[charNum];

        if (char === "(") {
          foundFirstParen = true;
          openParens++;
        } else if (char === ")") {
          openParens--;
        }

        if (foundFirstParen && openParens === 0) {
          return {
            conditionEndLine: lineNum,
            conditionEndChar: charNum,
          };
        }
      }
    }

    return { conditionEndLine: -1, conditionEndChar: -1 };
  }

  private createViolation(lineText: string): Violation {
    return {
      start: 0,
      end: lineText.length,
      message: "If statements should use curly braces",
    };
  }
}
