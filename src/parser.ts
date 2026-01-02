import { Token } from './lexer';
import PrimitiveLiteral from './primitiveLiteral';
import Expressions from './expressions';
import Query from './query';
import ResourcePath from './resourcePath';
import ODataUri from './odataUri';

export interface ParserOptions {
  metadata?: unknown;
}

/**
 * Parser factory - wraps a parsing function to handle input conversion
 */
export function parserFactory<T>(fn: (value: Uint16Array, index: number, metadata?: unknown) => T) {
  return function (source: string, options?: ParserOptions): T {
    options = options || {};
    const raw = new Uint16Array(source.length);
    const pos = 0;
    for (let i = 0; i < source.length; i++) {
      raw[i] = source.charCodeAt(i);
    }
    const result = fn(raw, pos, options.metadata);
    if (!result) throw new Error('Fail at ' + pos);
    const token = result as unknown as Token;
    if (token.next < raw.length) {
      throw new Error('Unexpected character at ' + token.next);
    }
    return result;
  };
}

/**
 * OData v4 Parser class
 */
export class Parser {
  /**
   * Parse a full OData URI
   */
  odataUri(source: string, options?: ParserOptions): Token {
    return parserFactory(ODataUri.odataUri)(source, options);
  }

  /**
   * Parse a resource path
   */
  resourcePath(source: string, options?: ParserOptions): Token {
    return parserFactory(ResourcePath.resourcePath)(source, options);
  }

  /**
   * Parse query options (e.g., "$filter=Name eq 'John'&$top=10")
   */
  query(source: string, options?: ParserOptions): Token {
    return parserFactory(Query.queryOptions)(source, options);
  }

  /**
   * Parse a filter expression (e.g., "Name eq 'John' and Age gt 21")
   */
  filter(source: string, options?: ParserOptions): Token {
    return parserFactory(Expressions.boolCommonExpr)(source, options);
  }

  /**
   * Parse key predicates (e.g., "(1)" or "(Id=1,Name='test')")
   */
  keys(source: string, options?: ParserOptions): Token {
    return parserFactory(Expressions.keyPredicate)(source, options);
  }

  /**
   * Parse a primitive literal value
   */
  literal(source: string, options?: ParserOptions): Token {
    return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
  }
}

// Standalone parsing functions
export function odataUri(source: string, options?: ParserOptions): Token {
  return parserFactory(ODataUri.odataUri)(source, options);
}

export function resourcePath(source: string, options?: ParserOptions): Token {
  return parserFactory(ResourcePath.resourcePath)(source, options);
}

export function query(source: string, options?: ParserOptions): Token {
  return parserFactory(Query.queryOptions)(source, options);
}

export function filter(source: string, options?: ParserOptions): Token {
  return parserFactory(Expressions.boolCommonExpr)(source, options);
}

export function keys(source: string, options?: ParserOptions): Token {
  return parserFactory(Expressions.keyPredicate)(source, options);
}

export function literal(source: string, options?: ParserOptions): Token {
  return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
}
