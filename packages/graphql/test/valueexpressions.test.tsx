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

});
