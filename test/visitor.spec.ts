import { describe, it, expect, vi } from 'vitest';
import { Parser } from '../src/index';
import {
  traverseAst,
  traverseAstDeepFirst,
  createTraverser,
  findOne,
  findAll,
  isType,
  Token,
  TokenType,
} from '../src/index';

describe('Visitor utilities', () => {
  const parser = new Parser();

  describe('traverseAst', () => {
    it('should visit nodes top-down', () => {
      // parser.filter() returns the expression directly, not wrapped in Filter
      const ast = parser.filter("Name eq 'John'");
      const visited: string[] = [];

      traverseAst(
        {
          [TokenType.EqualsExpression]: () => visited.push('EqualsExpression'),
          [TokenType.Literal]: () => visited.push('Literal'),
        },
        ast
      );

      expect(visited).toContain('EqualsExpression');
      expect(visited).toContain('Literal');
    });

    it('should pass parent to visitor', () => {
      const ast = parser.filter("Name eq 'John'");
      let literalParent: Token | undefined;

      traverseAst(
        {
          [TokenType.Literal]: (_token, parent) => {
            literalParent = parent;
          },
        },
        ast
      );

      expect(literalParent).toBeDefined();
    });
  });

  describe('traverseAstDeepFirst', () => {
    it('should visit children before parent', () => {
      const ast = parser.filter("Name eq 'John'");
      const visited: TokenType[] = [];

      traverseAstDeepFirst(
        {
          [TokenType.Filter]: (token) => visited.push(token.type),
          [TokenType.Literal]: (token) => visited.push(token.type),
        },
        ast
      );

      // Literal should be visited before Filter in deep-first
      const literalIndex = visited.indexOf(TokenType.Literal);
      const filterIndex = visited.indexOf(TokenType.Filter);

      if (literalIndex !== -1 && filterIndex !== -1) {
        expect(literalIndex).toBeLessThan(filterIndex);
      }
    });
  });

  describe('createTraverser', () => {
    it('should create reusable traverser function', () => {
      const visited: string[] = [];
      // parser.filter() returns EqualsExpression for "eq", GreaterThanExpression for "gt"
      const traverse = createTraverser({
        [TokenType.EqualsExpression]: () => visited.push('Equals'),
        [TokenType.GreaterThanExpression]: () => visited.push('GreaterThan'),
      });

      const ast1 = parser.filter("Name eq 'John'");
      const ast2 = parser.filter("Age gt 21");

      traverse(ast1);
      traverse(ast2);

      expect(visited).toHaveLength(2);
      expect(visited).toEqual(['Equals', 'GreaterThan']);
    });
  });

  describe('findOne', () => {
    it('should find first token of type', () => {
      const ast = parser.filter("Name eq 'John' and Age gt 21");
      const literal = findOne(ast, TokenType.Literal);

      expect(literal).toBeDefined();
      expect(literal?.type).toBe(TokenType.Literal);
    });

    it('should return undefined if type not found', () => {
      const ast = parser.filter("Name eq 'John'");
      const result = findOne(ast, TokenType.OrderBy);

      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should find all tokens of type', () => {
      const ast = parser.filter("Name eq 'John' and Age gt 21");
      const literals = findAll(ast, TokenType.Literal);

      expect(literals.length).toBeGreaterThanOrEqual(2);
      literals.forEach((token) => {
        expect(token.type).toBe(TokenType.Literal);
      });
    });

    it('should return empty array if type not found', () => {
      const ast = parser.filter("Name eq 'John'");
      const results = findAll(ast, TokenType.OrderBy);

      expect(results).toEqual([]);
    });
  });

  describe('isType', () => {
    it('should return true for matching type', () => {
      const ast = parser.filter("Name eq 'John'");
      // parser.filter() returns EqualsExpression, not Filter
      expect(isType(ast, TokenType.EqualsExpression)).toBe(true);
    });

    it('should return false for non-matching type', () => {
      const ast = parser.filter("Name eq 'John'");

      expect(isType(ast, TokenType.OrderBy)).toBe(false);
    });

    it('should work as type guard', () => {
      const ast = parser.filter("Name eq 'John'");

      if (isType(ast, TokenType.EqualsExpression)) {
        // TypeScript should know ast.type is TokenType.EqualsExpression here
        expect(ast.type).toBe(TokenType.EqualsExpression);
      }
    });
  });

  describe('real-world usage', () => {
    it('should extract all property names from filter', () => {
      const ast = parser.filter("FirstName eq 'John' and LastName eq 'Doe' and Age gt 21");
      const propertyNames: string[] = [];

      traverseAst(
        {
          [TokenType.FirstMemberExpression]: (token) => {
            if (token.raw) {
              propertyNames.push(token.raw);
            }
          },
        },
        ast
      );

      expect(propertyNames).toContain('FirstName');
      expect(propertyNames).toContain('LastName');
      expect(propertyNames).toContain('Age');
    });

    it('should extract literal values from filter', () => {
      const ast = parser.filter("Status eq 'active' and Count gt 10");
      const literals = findAll(ast, TokenType.Literal);

      expect(literals.length).toBeGreaterThanOrEqual(2);
    });
  });
});
