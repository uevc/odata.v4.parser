# CLAUDE.md - OData v4 Parser

## Project Overview

A zero-dependency OData v4 parser that outputs an Abstract Syntax Tree (AST). Based on JayStack's original odata-v4-parser (now unmaintained), modernized for current TypeScript standards.

**Goal**: Clean, typed, dependency-free OData parser that can be used with any database backend.

## Package Management

**ALWAYS use `yarn`**, never npm.

## Architecture

```
src/
├── parser.ts         # Main entry point - Parser class
├── lexer.ts          # TokenType enum (160+ types), Token class, char utilities
├── expressions.ts    # Filter expressions (eq, and, or, gt, lt, contains, etc.)
├── query.ts          # Query options ($filter, $top, $skip, $select, $orderby, etc.)
├── primitiveLiteral.ts   # Primitive value parsing (strings, numbers, dates, guids)
├── nameOrIdentifier.ts   # Property/path name parsing
├── resourcePath.ts   # Resource path parsing
├── odataUri.ts       # Full OData URI parsing
├── json.ts           # JSON array/object parsing
├── utils.ts          # String/char utilities
└── visitor.ts        # AST traversal utilities (traverseAst, findOne, findAll, isType)
```

## OData v4 Coverage

**~95% of spec supported:**
- Query options: `$filter`, `$select`, `$expand`, `$orderby`, `$top`, `$skip`, `$count`, `$search`, `$format`
- Operators: `eq`, `ne`, `lt`, `le`, `gt`, `ge`, `and`, `or`, `not`, `has`, arithmetic
- Functions: 35+ built-in (string, date, math, geo, type)
- Lambda: `any`, `all`
- All EDM primitive types

**Not supported**: `$apply` (aggregation), `$compute` (4.01 feature)

## Commands

```bash
yarn build           # Build with tsup (ESM + CJS + DTS)
yarn build:tsc       # Compile with tsc only
yarn typecheck       # Type check without emitting
yarn test            # Run Vitest tests
yarn test:watch      # Run tests in watch mode
yarn clean           # Remove dist and lib folders
```

## Development Rules

### Package Management
- **ALWAYS use `yarn`**, never npm
- Zero runtime dependencies - keep it that way

### Code Style
- Converting from `export default` namespaces to named exports
- Use modern TypeScript patterns (5.x)
- Strict mode enabled

### Testing
- Tests use Vitest (converted from Mocha/Chai)
- Test files in `test/` directory as TypeScript
- Run `yarn test` before committing
- 105 tests (5 parser + 87 primitive literal + 13 visitor)

### What NOT to Change
- Core parsing algorithm (it's correct per OASIS ABNF grammar)
- Token type values (would break consumers)

## Backlog

Future enhancements are documented in the `backlog/` directory.

## Usage Example

```typescript
import { Parser } from '@odata/parser';

const parser = new Parser();

// Parse a filter
const ast = parser.filter("Name eq 'John' and Age gt 21");

// Parse full query options
const query = parser.query("$filter=Status eq 'active'&$top=10&$orderby=CreatedAt desc");

// Access AST
console.log(query.value.options); // Array of parsed options
```

## AST Structure

Tokens have this shape:
```typescript
interface Token {
  position: number;    // Start position in source
  next: number;        // End position
  value: any;          // Parsed value (type depends on TokenType)
  type: TokenType;     // Discriminator
  raw: string;         // Original source text
}
```

## Integration Notes

This parser outputs AST only. To use with a database:
1. Parse query string → AST
2. Walk AST with visitor
3. Convert to database-specific query (Drizzle, Prisma, etc.)

The database conversion layer should be separate (e.g., `odata-drizzle` package).
