import { BaseRule, Violation } from './baseRule';
import * as vscode from 'vscode';
import { isInTemplate } from '../../../utils/parse';
import { getCompleteElement } from '../../../utils/template';

export class ImgAlt extends BaseRule {
    constructor() {
        super('ImgAlt');
    }

    check(lineText: string, document: vscode.TextDocument, lineNumber: number): Violation[] {
        const violations: Violation[] = [];

        // 只在模板部分检查
        if (!isInTemplate(document, lineNumber)) {
            return violations;
        }
        if(lineText.includes('<img')){
            const element = getCompleteElement(document, lineNumber);
            if(!element.some(line => line.includes('alt='))){
                violations.push({
                    start: lineNumber,
                    end: lineNumber,
                    message: 'img元素必须有alt属性'
                });
            }
        }
        

        return violations;
    }
}
