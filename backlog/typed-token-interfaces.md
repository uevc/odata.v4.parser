# Typed Token Interfaces

**Status**: Backlog
**Priority**: Low
**Effort**: Large (160+ token types)

## Problem

Currently, the `Token` class has a loosely typed `value` property:

```typescript
class Token {
  type: TokenType;  // discriminator
  value: any;       // no type information
}
```

When parsing `Name eq 'John'`, consumers get a token but have no TypeScript help for the shape of `value`.

## Proposed Solution

Create discriminated union types so TypeScript can narrow the `value` type based on `type`:

```typescript
interface EqualsExpressionToken {
  type: TokenType.EqualsExpression;
  value: {
    left: Token;
    right: Token;
  };
}

interface LiteralToken {
  type: TokenType.Literal;
  value: string;  // e.g., "Edm.String"
}

interface AndExpressionToken {
  type: TokenType.AndExpression;
  value: {
    left: Token;
    right: Token;
  };
}

// ... 160+ more interfaces

type TypedToken = EqualsExpressionToken | LiteralToken | AndExpressionToken | ...;
```

## Benefits

1. **Type narrowing**: TypeScript automatically knows the shape after type guards
   ```typescript
   if (token.type === TokenType.EqualsExpression) {
     console.log(token.value.left);  // TypeScript knows this exists
   }
   ```

2. **Better IDE support**: Autocomplete for `value` properties

3. **Compile-time safety**: Catch errors when accessing wrong properties

## Implementation Notes

- There are **160+ token types** in `TokenType` enum
- Each would need its `value` shape documented by reading the parser code
- Could be done incrementally (most common types first)
- Would require analyzing each parser function to determine output shape

## Common Token Value Shapes

Based on code analysis, common patterns include:

| Pattern | Token Types | Value Shape |
|---------|-------------|-------------|
| Binary expression | `AndExpression`, `OrExpression`, `EqualsExpression`, etc. | `{ left: Token, right: Token }` |
| Unary expression | `NotExpression`, `NegateExpression` | `Token` |
| Literal | `Literal` | `string` (EDM type name) |
| Collection | `Select`, `Expand`, `OrderBy` | `{ items: Token[] }` |
| Query options | `QueryOptions` | `Token[]` |

## Alternatives

1. **Keep `any`**: Works, but no type safety
2. **Use `unknown`**: Safer than `any`, forces type guards, but no narrowing help
3. **Partial typing**: Type only the most common tokens (e.g., top 20)

## Decision

Deferred - not blocking current work. The parser functions correctly without this enhancement. Consider implementing when:
- A consumer explicitly needs better typing
- Building a complex AST transformer that would benefit from type narrowing
