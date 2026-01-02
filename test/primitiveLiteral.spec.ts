import { describe, it, expect } from 'vitest';
import PrimitiveLiteral from '../src/primitiveLiteral';
import cases from './primitive-cases.json';

type SourceArray = number[] | Uint16Array;
type ParseFn = (value: SourceArray, index: number) => unknown;

interface TestCase {
  '-Name': string;
  '-Rule'?: string;
  '-FailAt'?: number;
  Input: string;
  result?: {
    next?: number;
    raw?: string;
    [key: string]: unknown;
  };
  result_error?: {
    next?: number;
    raw?: string;
    [key: string]: unknown;
  };
}

function getLiteralFunctionName(itemRule: string): string {
  switch (itemRule) {
    case 'string':
      return 'stringValue';
    case 'primitiveValue':
      return 'primitiveLiteral';
    default:
      return itemRule;
  }
}

describe('Primitive literals from json', () => {
  (cases as TestCase[]).forEach((item, index) => {
    const title = `#${index} should parse ${item['-Name']}: ${item.Input}`;
    let resultName: 'result' | 'result_error' = 'result';

    if (item.result === undefined) {
      resultName = 'result_error';
      item['-FailAt'] = item['-FailAt'] ?? 0;
    }

    const expectedResult = item[resultName];
    if (expectedResult !== undefined) {
      it(title, () => {
        // Parser expects Uint16Array (char codes)
        const source = new Uint16Array(item.Input.length);
        for (let i = 0; i < item.Input.length; i++) {
          source[i] = item.Input.charCodeAt(i);
        }
        if (expectedResult.next === undefined) expectedResult.next = item.Input.length;
        if (expectedResult.raw === undefined) expectedResult.raw = item.Input;

        const literalFunctionName = getLiteralFunctionName(item['-Rule'] || 'primitiveLiteral');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parseFn = (PrimitiveLiteral as any)[literalFunctionName] as ParseFn | undefined;
        const literal = (parseFn || PrimitiveLiteral.primitiveLiteral)(source, 0);

        if (item['-FailAt'] !== undefined) {
          expect(literal).toBeUndefined();
          return;
        }
        expect(literal).toEqual(expectedResult);
      });
    }
  });
});
