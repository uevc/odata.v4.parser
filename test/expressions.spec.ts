import { describe, it, expect } from 'vitest';
import Expressions from '../src/expressions';
import { TokenType } from '../src/lexer';

// Helper to convert string to Uint16Array for parser
function toArray(str: string): Uint16Array {
  return new Uint16Array(str.split('').map(c => c.charCodeAt(0)));
}

describe('Expressions', () => {
  describe('commonExpr', () => {
    it('should parse a simple identifier', () => {
      const input = toArray('Name');
      const result = Expressions.commonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.CommonExpression);
    });

    it('should parse a string literal', () => {
      const input = toArray("'hello'");
      const result = Expressions.commonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.CommonExpression);
    });

    it('should parse a number literal', () => {
      const input = toArray('42');
      const result = Expressions.commonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.CommonExpression);
    });

    it('should parse arithmetic expressions', () => {
      const input = toArray('Price add 10');
      const result = Expressions.commonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.CommonExpression);
    });
  });

  describe('boolCommonExpr', () => {
    it('should parse equals expression', () => {
      const input = toArray("Name eq 'John'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.EqualsExpression);
    });

    it('should parse not equals expression', () => {
      const input = toArray("Status ne 'active'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.NotEqualsExpression);
    });

    it('should parse less than expression', () => {
      const input = toArray('Age lt 30');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.LesserThanExpression);
    });

    it('should parse less than or equal expression', () => {
      const input = toArray('Age le 30');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.LesserOrEqualsExpression);
    });

    it('should parse greater than expression', () => {
      const input = toArray('Age gt 21');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.GreaterThanExpression);
    });

    it('should parse greater than or equal expression', () => {
      const input = toArray('Age ge 21');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.GreaterOrEqualsExpression);
    });

    it('should parse AND expression', () => {
      const input = toArray("Name eq 'John' and Age gt 21");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.AndExpression);
    });

    it('should parse OR expression', () => {
      const input = toArray("Status eq 'active' or Status eq 'pending'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.OrExpression);
    });

    it('should parse NOT expression', () => {
      const input = toArray("not Status eq 'deleted'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.NotExpression);
    });

    it('should parse complex nested expression', () => {
      const input = toArray("(Name eq 'John' or Name eq 'Jane') and Age gt 21");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.type).toBe(TokenType.AndExpression);
    });
  });

  describe('Method calls', () => {
    it('should parse contains', () => {
      const input = toArray("contains(Name,'john')");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('contains');
    });

    it('should parse startswith', () => {
      const input = toArray("startswith(Name,'J')");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('startswith');
    });

    it('should parse endswith', () => {
      const input = toArray("endswith(Email,'@example.com')");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('endswith');
    });

    it('should parse length', () => {
      const input = toArray('length(Name) gt 5');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('length');
    });

    it('should parse tolower', () => {
      const input = toArray("tolower(Name) eq 'john'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('tolower');
    });

    it('should parse toupper', () => {
      const input = toArray("toupper(Name) eq 'JOHN'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('toupper');
    });

    it('should parse trim', () => {
      const input = toArray("trim(Name) eq 'John'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('trim');
    });

    it('should parse substring', () => {
      const input = toArray("substring(Name,0,1) eq 'J'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('substring');
    });

    it('should parse concat', () => {
      const input = toArray("concat(FirstName,LastName) eq 'JohnDoe'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('concat');
    });

    it('should parse indexof', () => {
      const input = toArray("indexof(Name,'o') gt 0");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('indexof');
    });
  });

  describe('Date/Time functions', () => {
    it('should parse year', () => {
      const input = toArray('year(BirthDate) eq 1990');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('year');
    });

    it('should parse month', () => {
      const input = toArray('month(BirthDate) eq 6');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('month');
    });

    it('should parse day', () => {
      const input = toArray('day(BirthDate) eq 15');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('day');
    });

    it('should parse hour', () => {
      const input = toArray('hour(CreatedAt) eq 14');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('hour');
    });

    it('should parse minute', () => {
      const input = toArray('minute(CreatedAt) eq 30');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('minute');
    });

    it('should parse second', () => {
      const input = toArray('second(CreatedAt) eq 45');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('second');
    });
  });

  describe('Math functions', () => {
    it('should parse round', () => {
      const input = toArray('round(Price) eq 10');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('round');
    });

    it('should parse floor', () => {
      const input = toArray('floor(Price) eq 9');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('floor');
    });

    it('should parse ceiling', () => {
      const input = toArray('ceiling(Price) eq 10');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
      expect(result.raw).toContain('ceiling');
    });
  });

  describe('Lambda expressions', () => {
    it('should parse any expression', () => {
      const input = toArray("Orders/any(o:o/Amount gt 100)");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse all expression', () => {
      const input = toArray("Orders/all(o:o/Status eq 'shipped')");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });
  });

  describe('Arithmetic expressions', () => {
    it('should parse add', () => {
      const input = toArray('Price add Tax gt 100');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse sub', () => {
      const input = toArray('Price sub Discount lt 50');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse mul', () => {
      const input = toArray('Quantity mul Price gt 1000');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse div', () => {
      const input = toArray('Total div Count eq 10');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse mod', () => {
      const input = toArray('Id mod 2 eq 0');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should return undefined for invalid input', () => {
      const input = toArray('???invalid???');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeUndefined();
    });

    it('should handle whitespace', () => {
      const input = toArray("Name   eq   'John'");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should handle parentheses', () => {
      const input = toArray("(Age gt 21)");
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse null comparison', () => {
      const input = toArray('Name eq null');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });

    it('should parse boolean literals', () => {
      const input = toArray('IsActive eq true');
      const result = Expressions.boolCommonExpr(input, 0);
      expect(result).toBeDefined();
    });
  });
});
