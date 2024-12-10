import * as vscode from "vscode";
import { BaseRule, Violation } from "./baseRule";
import { getCompleteElement } from "../../../utils/template";

interface VForInfo {
  item: string;
  index: string;
}

interface KeyInfo {
  value: string;
  position: number;
  line: number;
}

interface ElementInfo {
  lines: string[];
  content: string;
  vForPosition: number;
  vForLine: number;
}

export class VForKey extends BaseRule {
  private violations: Violation[] = [];

  constructor() {
    super("VForKey");
  }

  check(
    lineText: string,
    document: vscode.TextDocument,
    lineNumber: number
  ): Violation[] {
    this.violations = [];

    // 快速检查：如果当前行没有v-for，直接返回
    if (!lineText.includes("v-for")) {
      return this.violations;
    }

    const elementInfo = this.getElementInfo(document, lineNumber);

    // 检查是否缺少key属性
    if (this.isMissingKey(elementInfo.content)) {
      this.addMissingKeyViolation(elementInfo);
      return this.violations;
    }

    // 检查key是否使用了index
    this.checkKeyValue(elementInfo);

    return this.violations;
  }

  // 获取所有的元素信息
  private getElementInfo(
    document: vscode.TextDocument,
    lineNumber: number
  ): ElementInfo {
    const lines = getCompleteElement(document, lineNumber);
    const content = lines.join("\n");
    const vForLine = lines.findIndex((line) => line.includes("v-for"));
    const vForPosition = lines[vForLine].indexOf("v-for");

    return {
      lines,
      content,
      vForLine,
      vForPosition,
    };
  }

  // 检查是否缺少key属性
  private isMissingKey(content: string): boolean {
    return !content.includes(":key") && !content.includes("v-bind:key");
  }

  // 添加缺少key属性的 违规信息
  private addMissingKeyViolation(elementInfo: ElementInfo): void {
    this.violations.push({
      start: elementInfo.vForPosition,
      end: elementInfo.vForPosition + "v-for".length,
      message: "使用 v-for 时必须指定 key 属性",
    });
  }

  // 检查key值是否使用了index，如果使用了，则添加违规信息
  private checkKeyValue(elementInfo: ElementInfo): void {
    const vForInfo = this.parseVForDirective(elementInfo.content);
    const keyInfo = this.parseKeyDirective(elementInfo);

    if (vForInfo && keyInfo && this.isIndexUsedAsKey(vForInfo, keyInfo)) {
      this.addKeyValueViolation(keyInfo);
    }
  }

  // 解析v-for指令的参数
  private parseVForDirective(content: string): VForInfo | null {
    const patterns = {
      withParentheses: /v-for="\(([^,]+),\s*([^)]+)\)/, // (item, index)
      withoutParentheses: /v-for="([^,]+),\s*([^)]+)/, // item, index
    };

    for (const pattern of Object.values(patterns)) {
      const match = content.match(pattern);
      if (match) {
        return {
          item: match[1].trim(),
          index: match[2].trim().split(/\s+/)[0], // 移除 in/of 部分
        };
      }
    }
    return null;
  }

  // 解析key值
  private parseKeyDirective(elementInfo: ElementInfo): KeyInfo | null {
    const { lines, content } = elementInfo;
    const keyPattern = /:key="([^"]+)"|v-bind:key="([^"]+)"/;
    const match = content.match(keyPattern);

    if (!match) {
      return null;
    }

    const value = (match[1] || match[2]).trim();
    const keyLine = lines.findIndex(
      (line) =>
        line.includes(`:key="${value}"`) ||
        line.includes(`v-bind:key="${value}"`)
    );
    const keyPosition = lines[keyLine].indexOf("key");

    return {
      value,
      position: keyPosition,
      line: keyLine,
    };
  }

  // 检查key值是否使用了index
  private isIndexUsedAsKey(vForInfo: VForInfo, keyInfo: KeyInfo): boolean {
    return vForInfo.index === keyInfo.value;
  }

  // 添加key值使用index时的 违规信息
  private addKeyValueViolation(keyInfo: KeyInfo): void {
    this.violations.push({
      start: keyInfo.position,
      end: keyInfo.position + keyInfo.value.length + 6,
      message: "不建议使用 v-for 的索引作为 key 值",
    });
  }
}
