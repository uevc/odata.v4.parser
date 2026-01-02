import { Token, TokenType } from './lexer';

/**
 * Visitor/Traverser type - handlers for each token type
 */
export type Visitor = {
  [K in TokenType]?: (token: Token, parent?: Token) => void;
};

/**
 * Alias for Visitor
 */
export type Traverser = Visitor;

/**
 * Check if a value is an array
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Token);
}

/**
 * Traverse AST with visitor (breadth-first)
 * Calls visitor for node first, then traverses children
 */
export function traverseAst(visitor: Visitor, node: Token, parent?: Token): void {
  if (node instanceof Token) {
    const handler = visitor[node.type];
    if (handler) {
      handler(node, parent);
    }
  }

  const value = node?.value as Record<string, unknown> | unknown[] | Token | undefined;

  if (isArray(value) || isPlainObject(value)) {
    const items = isArray(value) ? value : Object.values(value);
    for (const item of items) {
      if (item instanceof Token) {
        traverseAst(visitor, item, node);
      }
    }
  }

  // Handle options array
  if (isPlainObject(value) && isArray((value as Record<string, unknown>).options)) {
    for (const item of (value as { options: unknown[] }).options) {
      if (item instanceof Token) {
        traverseAst(visitor, item, node);
      }
    }
  }

  // Handle items array
  if (isPlainObject(value) && isArray((value as Record<string, unknown>).items)) {
    for (const item of (value as { items: unknown[] }).items) {
      if (item instanceof Token) {
        traverseAst(visitor, item, node);
      }
    }
  }

  // Handle direct Token value
  if (value instanceof Token) {
    traverseAst(visitor, value, node);
  }
}

/**
 * Traverse AST with visitor (depth-first)
 * Traverses children first, then calls visitor for node
 */
export function traverseAstDeepFirst(visitor: Visitor, node: Token, parent?: Token): void {
  const value = node?.value as Record<string, unknown> | unknown[] | Token | undefined;

  if (isArray(value) || isPlainObject(value)) {
    const items = isArray(value) ? value : Object.values(value);
    for (const item of items) {
      if (item instanceof Token) {
        traverseAstDeepFirst(visitor, item, node);
      }
    }
  }

  // Handle direct Token value
  if (value instanceof Token) {
    traverseAstDeepFirst(visitor, value, node);
  }

  // Handle options array
  if (isPlainObject(value) && isArray((value as Record<string, unknown>).options)) {
    for (const item of (value as { options: unknown[] }).options) {
      if (item instanceof Token) {
        traverseAstDeepFirst(visitor, item, node);
      }
    }
  }

  // Handle items array
  if (isPlainObject(value) && isArray((value as Record<string, unknown>).items)) {
    for (const item of (value as { items: unknown[] }).items) {
      if (item instanceof Token) {
        traverseAstDeepFirst(visitor, item, node);
      }
    }
  }

  // Call visitor after children
  if (node instanceof Token) {
    const handler = visitor[node.type];
    if (handler) {
      handler(node, parent);
    }
  }
}

/**
 * Create a traverser function
 * @param visitor - The visitor handlers
 * @param deepFirst - If true, use depth-first traversal
 */
export function createTraverser(visitor: Visitor, deepFirst = false): (node: Token) => void {
  return (node: Token): void => {
    if (deepFirst) {
      traverseAstDeepFirst(visitor, node);
    } else {
      traverseAst(visitor, node);
    }
  };
}

/**
 * Find first token matching a type
 */
export function findOne(ast: Token, type: TokenType): Token | undefined {
  let found: Token | undefined;

  traverseAst({
    [type]: (token: Token) => {
      if (!found) found = token;
    },
  }, ast);

  return found;
}

/**
 * Find all tokens matching a type
 */
export function findAll(ast: Token, type: TokenType): Token[] {
  const results: Token[] = [];

  traverseAst({
    [type]: (token: Token) => {
      results.push(token);
    },
  }, ast);

  return results;
}

/**
 * Check if a token is of a specific type (type guard)
 */
export function isType<T extends TokenType>(token: Token, type: T): token is Token & { type: T } {
  return token.type === type;
}
