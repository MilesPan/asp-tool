import { DiagnosticSeverity, TextDocument } from "vscode";
import { BaseRule, Violation } from "./baseRule";
import {
  getFunctionBody,
  isInInnerFunction,
  isInTemplate,
} from "../../../utils/parse";

type CssProperty = {
  property: string;
  value: string;
  start: number;
  end: number;
};

export class NoUseCode extends BaseRule {
  violations: Violation[];
  constructor() {
    super("NoUseCode");
    this.violations = [];
  }

  check(
    lineText: string,
    document: TextDocument,
    lineNumber: number
  ): Violation[] {
    this.violations = [];

    // 1. 首先检查是否存在行内样式
    if (this.checkInlineStyle(lineText, document, lineNumber)) {
      return this.violations; // 如果有行内样式，直接返回警告，不继续检查
    }

    // 2. 如果是CSS文件中的样式，则检查无用的属性
    this.checkUselessCssProperties(lineText);

    // 3. 检查是否有console.xxx这类调试代码
    this.checkConsoleCode(lineText);

    this.checkUselessAsync(lineText, document, lineNumber);
    return this.violations;
  }

  // 检查行内样式
  private checkInlineStyle(
    lineText: string,
    document: TextDocument,
    lineNumber: number
  ): boolean {
    if (!isInTemplate(document, lineNumber)) {
      return false;
    }
    // 只匹配普通行内样式 style=，不匹配 :style 或 v-bind:style
    const styleAttrPattern = /(?<=^|\s)style=/;
    const match = lineText.match(styleAttrPattern);

    if (match) {
      const start = match.index!;
      const end = start + match[0].length;

      this.violations.push({
        start,
        end,
        message: "不建议使用行内样式，请将样式移至CSS文件中",
      });
      return true;
    }

    return false;
  }

  // 检查无用的CSS属性
  private checkUselessCssProperties(lineText: string) {
    // 只处理CSS文件中的属性
    const cssProperties = this.extractCssProperties(lineText);

    for (const prop of cssProperties) {
      if (this.isUselessValue(prop.value)) {
        this.violations.push({
          start: prop.start,
          end: prop.end,
          message: `无用的CSS属性值: "${prop.property}: ${prop.value}"，建议直接使用 "${prop.property}: 0"`,
        });
      }
    }
  }

  private extractCssProperties(lineText: string): CssProperty[] {
    const properties: CssProperty[] = [];

    // 只匹配CSS文件格式: margin: 0px;
    const cssPattern = /([a-zA-Z-]+)\s*:\s*([^"'][^;]+);?/g;
    const matches = lineText.matchAll(cssPattern);

    for (const match of matches) {
      properties.push({
        property: match[1].trim(),
        value: match[2].trim(),
        start: match.index!,
        end: match.index! + match[0].length,
      });
    }

    return properties;
  }

  private isUselessValue(value: string): boolean {
    // 匹配 0px, 0rem, 0em, 0vh, 0vw 等...
    const zeroWithUnitPattern =
      /^0(%|px|rem|em|rpx|vh|vw|vmin|vmax|cm|mm|in|pt|pc)$/;
    const trimmedValue = value.trim();
    return zeroWithUnitPattern.test(trimmedValue);
  }

  // 检查console.xxx这类调试代码
  private checkConsoleCode(lineText: string) {
    // 只匹配 console.xxx 这类调试代码
    const consolePattern = /console\./;
    const match = lineText.match(consolePattern);
    if (match) {
      this.violations.push({
        start: match.index!,
        end: lineText.length,
        message: "记得删除调试代码",
        type: DiagnosticSeverity.Information,
      });
    }
  }

  // 检查无用的async声明
  private checkUselessAsync(lineText: string, document: TextDocument, lineNumber: number) {
    if (!lineText.includes('async')) {
      return;
    }
  
    const functionBody = getFunctionBody(document, lineNumber);
    if (!functionBody) return;
  
    // 检查当前函数作用域内的await
    let topLevelAwaitCount = 0;
    let braceCount = 0;
  
    // 遍历函数体内容
    for (const line of functionBody.content) {
      // 更新花括号计数
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
  
      // 只统计顶层作用域的await（braceCount === 1表示在当前函数的最外层）
      if (braceCount === 1) {
        const awaitMatches = line.match(/\bawait\b/g);
        if (awaitMatches) {
          topLevelAwaitCount += awaitMatches.length;
        }
      }
    }
  
    // 如果当前函数作用域内没有顶层await，则标记为无用async
    if (topLevelAwaitCount === 0) {
      const asyncMatch = lineText.match(/\basync\b/);
      if (asyncMatch) {
        this.violations.push({
          start: asyncMatch.index!,
          end: asyncMatch.index! + 'async'.length,
          message: "此函数内未使用await，async声明可以删除",
          type: DiagnosticSeverity.Information
        });
      }
    }
  }
}
