/**
 * OData v4 Parser
 *
 * A zero-dependency OData v4 parser that outputs an Abstract Syntax Tree (AST).
 *
 * @example
 * ```typescript
 * import { Parser, filter, query } from '@odata/parser';
 *
 * // Using the Parser class
 * const parser = new Parser();
 * const ast = parser.filter("Name eq 'John' and Age gt 21");
 *
 * // Using standalone functions
 * const filterAst = filter("Status eq 'active'");
 * const queryAst = query("$filter=Name eq 'John'&$top=10&$orderby=Age desc");
 * ```
 */

// Core types
export { Token, TokenType, TokenInit, LexerToken, LexerTokenType } from './lexer';

// Parser
export { Parser, ParserOptions, parserFactory, odataUri, resourcePath, query, filter, keys, literal } from './parser';

// Visitor utilities
export {
  Visitor,
  Traverser,
  traverseAst,
  traverseAstDeepFirst,
  createTraverser,
  findOne,
  findAll,
  isType,
} from './visitor';

// Utils (for advanced usage - access via Utils.stringify, Utils.equals, etc.)
export { default as Utils } from './utils';

// Low-level parsers: Import directly from source if needed
// e.g., import PrimitiveLiteral from './primitiveLiteral'
// (not re-exported here due to legacy namespace types)

// Default parser instance
import { Parser } from './parser';
export const defaultParser = new Parser();
