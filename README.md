# @uev/odata-parser

Zero-dependency OData v4 parser that outputs an Abstract Syntax Tree (AST). Use with any database backend.

## Features

- **Zero runtime dependencies** - Pure TypeScript
- **~95% OData v4 spec coverage** - All common query options and operators
- **Database agnostic** - Outputs AST, you convert to your database's query format
- **Full TypeScript support** - Typed tokens and visitor utilities
- **Dual module format** - ESM and CommonJS

## Installation

```bash
yarn add @uev/odata-parser
# or
npm install @uev/odata-parser
```

## Quick Start

```typescript
import { Parser, filter, query } from '@uev/odata-parser';

// Using the Parser class
const parser = new Parser();
const ast = parser.filter("Name eq 'John' and Age gt 21");

// Using standalone functions
const filterAst = filter("Status eq 'active'");
const queryAst = query("$filter=Name eq 'John'&$top=10&$orderby=Age desc");

// Access parsed values
console.log(queryAst.value.options); // Array of parsed query options
```

## AST Structure

Every parsed result is a `Token` with this shape:

```typescript
interface Token {
  position: number;    // Start position in source
  next: number;        // End position
  type: TokenType;     // What kind of token (EqualsExpression, Literal, etc.)
  raw: string;         // Original source text
  value: any;          // Parsed content (shape depends on type)
}
```

**Example**: Parsing `Name eq 'John'` returns:

```typescript
{
  position: 0,
  next: 15,
  type: "EqualsExpression",
  raw: "Name eq 'John'",
  value: {
    left: { type: "FirstMemberExpression", raw: "Name", value: {...} },
    right: { type: "Literal", raw: "'John'", value: "Edm.String" }
  }
}
```

## Error Handling

The parser returns `undefined` when parsing fails (does not throw):

```typescript
const result = parser.filter("invalid ??? syntax");
if (!result) {
  console.log("Parse failed");
}
```

## Supported Query Options

| Option | Example |
|--------|---------|
| `$filter` | `Name eq 'John' and Age gt 21` |
| `$select` | `Name,Age,Email` |
| `$expand` | `Orders($select=Id,Total)` |
| `$orderby` | `CreatedAt desc,Name asc` |
| `$top` | `10` |
| `$skip` | `20` |
| `$count` | `true` |
| `$search` | `"search term"` |

## Filter Operators

- **Comparison**: `eq`, `ne`, `lt`, `le`, `gt`, `ge`, `has`
- **Logical**: `and`, `or`, `not`
- **Arithmetic**: `add`, `sub`, `mul`, `div`, `mod`

## Built-in Functions

- **String**: `contains`, `startswith`, `endswith`, `length`, `indexof`, `substring`, `tolower`, `toupper`, `trim`, `concat`
- **Date/Time**: `year`, `month`, `day`, `hour`, `minute`, `second`, `now`, `date`, `time`
- **Math**: `round`, `floor`, `ceiling`
- **Lambda**: `any`, `all`

## AST Traversal

```typescript
import { Parser, traverseAst, findAll, TokenType } from '@uev/odata-parser';

const parser = new Parser();
const ast = parser.query("$filter=Name eq 'John'&$orderby=Age desc");

// Find all tokens of a specific type
const orderByItems = findAll(ast, TokenType.OrderByItem);

// Custom traversal
traverseAst({
  [TokenType.EqualsExpression]: (token, parent) => {
    console.log('Found equals:', token.raw);
  },
  [TokenType.OrderByItem]: (token) => {
    console.log('Order by:', token.raw);
  },
}, ast);
```

## Integration Example

The parser outputs AST only. Here's how you'd convert to a database query:

```typescript
import { Parser, traverseAst, TokenType } from '@uev/odata-parser';

function buildWhereClause(filterString: string): string {
  const parser = new Parser();
  const ast = parser.filter(filterString);
  if (!ast) return '';

  const conditions: string[] = [];

  traverseAst({
    [TokenType.EqualsExpression]: (token) => {
      const field = token.value.left.raw;
      const value = token.value.right.raw;
      conditions.push(`${field} = ${value}`);
    },
    [TokenType.GreaterThanExpression]: (token) => {
      const field = token.value.left.raw;
      const value = token.value.right.raw;
      conditions.push(`${field} > ${value}`);
    },
  }, ast);

  return conditions.join(' AND ');
}

buildWhereClause("Name eq 'John' and Age gt 21");
// → "Name = 'John' AND Age > 21"
```

## Not Currently Supported

These OData v4 features are **not implemented**:

- `$apply` - Aggregation transformations
- `$compute` - Computed properties (OData 4.01)

## Building

```bash
yarn install
yarn build        # Build with tsup (ESM + CJS)
yarn typecheck    # Type check without emitting
yarn test         # Run tests
```

## License

MIT

## Attribution

This parser is based on the original [odata-v4-parser](https://github.com/jaystack/odata-v4-parser) by JayStack, which implemented the OASIS OData v4 ABNF grammar. That project is no longer maintained.