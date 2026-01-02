# Parser Limitations

This document tracks OData v4 features that are **not implemented** in the parser.

## Known Unsupported Patterns

These patterns are tested in `test/cases.spec.ts` and intentionally skipped:

| Pattern | Reason | Example |
|---------|--------|---------|
| `$ref` | Reference navigation not implemented | `$expand=Orders/$ref` |
| `$it` | Implicit variable not implemented | `$filter=$it/Name eq 'John'` |
| `$count=` | Inline count in $expand not implemented | `$expand=Orders($count=true)` |
| `/$count` | Count path segment not implemented | `Orders/$count` |
| `text/` | Media type format not implemented | `$format=text/html` |
| `application/` | Media type format not implemented | `$format=application/json` |
| `@` | Parameter aliases not implemented | `@delta` |
| `Model.` | Qualified action/function names not implemented | `Model.Action()` |
| `Namespace.` | Qualified type names in select not implemented | `$select=Namespace.Type/Property` |
| `()` | Action/function call syntax in select not implemented | `$select=Action()` |
| `!` | Custom query option with ! prefix not implemented | `!deltatoken='...'` |
| `%27` | URL encoded characters in custom options not implemented | `search=O%27Neil` |

## Unmapped Parser Rules

These rules exist in `cases.json` but have no corresponding parser function exported:

- `dummyStartRule` - Test rule, not real
- `odataRelativeUri` - Not exported from odataUri.ts
- `entitySetName` - Not directly testable
- `functionParameter` - Not directly testable
- `primitiveLiteral` - Tested separately in primitiveLiteral.spec.ts
- `boolcommonExpr` - Case mismatch (should be `boolCommonExpr`)
- `complexInUri` - Not exported
- `enum` - Not exported
- `header` - HTTP header parsing, not URI parsing
- `prefer` - HTTP header parsing
- `preference` - HTTP header parsing
- `includeAnnotationsPreference` - HTTP header parsing
- `maxpagesizePreference` - HTTP header parsing

## Coverage Summary

- **~95% of OData v4 spec supported** (as documented in README)
- **~70% of test cases from cases.json have parser mappings**
- **~85% of mapped test cases pass** (rest are known limitations above)

## Future Implementation

These features could be added to the parser if needed. Priority should be based on actual usage requirements. See individual backlog items for implementation details.
