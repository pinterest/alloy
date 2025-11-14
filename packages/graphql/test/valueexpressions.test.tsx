import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("ValueExpression Component", () => {
  it("renders null values", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={null} />]);
    expect(result).toBe("null");
  });

  it("renders undefined as null", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={undefined} />]);
    expect(result).toBe("null");
  });

  it("renders boolean true", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={true} />]);
    expect(result).toBe("true");
  });

  it("renders boolean false", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={false} />]);
    expect(result).toBe("false");
  });

  it("renders integer numbers", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={42} />]);
    expect(result).toBe("42");
  });

  it("renders negative numbers", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={-10} />]);
    expect(result).toBe("-10");
  });

  it("renders float numbers", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={3.14} />]);
    expect(result).toBe("3.14");
  });

  it("renders strings with quotes", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue="Hello, World!" />,
    ]);
    expect(result).toBe('"Hello, World!"');
  });

  it("escapes quotes in strings", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue='The sign says "Hello"' />,
    ]);
    expect(result).toBe('"The sign says \\"Hello\\""');
  });

  it("handles strings with special characters", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue="hello\nworld" />,
    ]);
    // Newlines are preserved as-is in the string
    expect(result).toBe('"hello\\nworld"');
  });

  it("renders empty arrays", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={[]} />]);
    expect(result).toBe("[]");
  });

  it("renders simple arrays", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={[1, 2, 3]} />]);
    expect(result).toRenderTo(d`
      [1, 2, 3]
    `);
  });

  it("renders arrays with strings", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={["foo", "bar", "baz"]} />,
    ]);
    expect(result).toRenderTo(d`
      ["foo", "bar", "baz"]
    `);
  });

  it("renders arrays with mixed types", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={[1, "two", true]} />,
    ]);
    expect(result).toRenderTo(d`
      [1, "two", true]
    `);
  });

  it("renders nested arrays", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={[
          [1, 2],
          [3, 4],
        ]}
      />,
    ]);
    expect(result).toRenderTo(d`
      [[1, 2], [3, 4]]
    `);
  });

  it("renders empty objects", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={{}} />]);
    expect(result).toBe("{}");
  });

  it("renders simple objects", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={{ name: "Alice", age: 30 }} />,
    ]);
    expect(result).toRenderTo(d`
      {name: "Alice", age: 30}
    `);
  });

  it("renders objects with various value types", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={{
          id: 123,
          active: true,
          name: "Test",
          score: null,
        }}
      />,
    ]);
    expect(result).toRenderTo(d`
      {id: 123, active: true, name: "Test", score: null}
    `);
  });

  it("renders nested objects", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={{
          user: {
            name: "Bob",
            email: "bob@example.com",
          },
        }}
      />,
    ]);
    expect(result).toRenderTo(d`
      {user: {name: "Bob", email: "bob@example.com"}}
    `);
  });

  it("renders objects with arrays", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={{
          tags: ["graphql", "typescript"],
          count: 2,
        }}
      />,
    ]);
    expect(result).toRenderTo(d`
      {tags: ["graphql", "typescript"], count: 2}
    `);
  });

  it("renders complex nested structures", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={{
          user: {
            name: "Alice",
            roles: ["ADMIN", "USER"],
            metadata: {
              lastLogin: "2024-01-01",
              active: true,
            },
          },
        }}
      />,
    ]);
    expect(result).toRenderTo(d`
      {
        user: {
          name: "Alice",
          roles: ["ADMIN", "USER"],
          metadata: {lastLogin: "2024-01-01", active: true}}}
    `);
  });

  it("can be used inline in text", () => {
    const result = toGraphQLText([
      <>
        field(arg: String = <gql.ValueExpression jsValue="default" />)
      </>,
    ]);
    expect(result).toBe('field(arg: String = "default")');
  });

  it("can render directive argument values", () => {
    const result = toGraphQLText([
      <>
        @deprecated(reason:{" "}
        <gql.ValueExpression jsValue="Use newField instead" />)
      </>,
    ]);
    expect(result).toBe('@deprecated(reason: "Use newField instead")');
  });

  it("renders zero value", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={0} />]);
    expect(result).toBe("0");
  });

  it("renders negative zero", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={-0} />]);
    expect(result).toBe("0");
  });

  it("renders empty string", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue="" />]);
    expect(result).toBe('""');
  });

  it("renders very large numbers", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={9999999999} />,
    ]);
    expect(result).toBe("9999999999");
  });

  it("renders very small decimal numbers", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={0.0001} />]);
    expect(result).toBe("0.0001");
  });

  it("renders scientific notation numbers", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={1e10} />]);
    expect(result).toBe("10000000000");
  });

  it("renders negative float", () => {
    const result = toGraphQLText([<gql.ValueExpression jsValue={-3.14159} />]);
    expect(result).toBe("-3.14159");
  });

  it("renders deeply nested arrays", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={[
          [
            [1, 2],
            [3, 4],
          ],
          [
            [5, 6],
            [7, 8],
          ],
        ]}
      />,
    ]);
    expect(result).toRenderTo(d`
      [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
    `);
  });

  it("renders deeply nested objects", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={{
          level1: {
            level2: {
              level3: {
                level4: {
                  value: "deep",
                },
              },
            },
          },
        }}
      />,
    ]);
    expect(result).toRenderTo(d`
      {level1: {level2: {level3: {level4: {value: "deep"}}}}}
    `);
  });

  it("renders array with only null values", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={[null, null, null]} />,
    ]);
    expect(result).toRenderTo(d`
      [null, null, null]
    `);
  });

  it("renders object with null values", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={{ a: null, b: null, c: "value" }} />,
    ]);
    expect(result).toRenderTo(d`
      {a: null, b: null, c: "value"}
    `);
  });

  it("renders array with mixed nested structures", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={[1, "string", { nested: "object" }, [1, 2, 3], true, null]}
      />,
    ]);
    expect(result).toRenderTo(d`
      [1, "string", {nested: "object"}, [1, 2, 3], true, null]
    `);
  });

  it("renders string with tab characters", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue="hello\tworld" />,
    ]);
    expect(result).toBe('"hello\\tworld"');
  });

  it("renders string with carriage return", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue="hello\rworld" />,
    ]);
    expect(result).toBe('"hello\\rworld"');
  });

  it("renders string with backslash", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue="path\\to\\file" />,
    ]);
    expect(result).toBe('"path\\\\to\\\\file"');
  });

  it("renders unicode characters in strings", () => {
    const result = toGraphQLText([
      <gql.ValueExpression jsValue="Hello 🌍 World" />,
    ]);
    expect(result).toBe('"Hello 🌍 World"');
  });

  it("renders very long strings", () => {
    const longString = "a".repeat(1000);
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={longString} />,
    ]);
    expect(result).toBe(`"${longString}"`);
  });

  it("renders object with special key names", () => {
    const result = toGraphQLText([
      <gql.ValueExpression
        jsValue={{
          "special-key": "value1",
          special_key: "value2",
          specialKey: "value3",
        }}
      />,
    ]);
    // Note: GraphQL doesn't quote object keys (they're not strings in the SDL)
    expect(result).toContain("special-key:");
    expect(result).toContain("special_key:");
    expect(result).toContain("specialKey:");
  });

  it("renders large arrays with many elements", () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => i);
    const result = toGraphQLText([
      <gql.ValueExpression jsValue={largeArray} />,
    ]);
    // Large arrays are formatted with line breaks
    expect(result).toContain("0");
    expect(result).toContain("99");
    expect(result).toMatch(/^\[/); // starts with [
    expect(result).toMatch(/\]$/); // ends with ]
  });
});
