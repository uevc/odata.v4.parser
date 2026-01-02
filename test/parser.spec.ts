import { describe, it, expect } from 'vitest';
import { Parser } from '../src/index';

describe('Parser', () => {
  it('should instantiate odata parser', () => {
    const parser = new Parser();
    const ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
    expect(
      ast.value.value.value.value.next.value.value.predicate.value.value.right
        .value
    ).toBe('Edm.String');
  });

  it('should parse query string', () => {
    const parser = new Parser();
    const ast = parser.query("$filter=Title eq 'alma'");
    expect(ast.value.options[0].type).toBe('Filter');
  });

  it('should parse multiple orderby params', () => {
    const parser = new Parser();
    const ast = parser.query('$orderby=foo,bar');
    expect(ast.value.options[0].value.items[0].raw).toBe('foo');
    expect(ast.value.options[0].value.items[1].raw).toBe('bar');
  });

  it('should parse custom query options', () => {
    const parser = new Parser();
    const ast = parser.query('foo=123&bar=foobar');
    expect(ast.value.options[0].value.key).toBe('foo');
    expect(ast.value.options[0].value.value).toBe('123');
    expect(ast.value.options[1].value.key).toBe('bar');
    expect(ast.value.options[1].value.value).toBe('foobar');
  });

  it('should throw error parsing invalid custom query options', () => {
    const parser = new Parser();
    let error = false;
    try {
      parser.query('$foo=123');
      error = true;
    } catch (_err) {
      // Expected to throw
    }
    expect(error).toBe(false);
  });
});
