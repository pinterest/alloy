import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Argument", () => {
  it("renders an argument with a string literal", () => {
    const result = toGraphQLText([<gql.Argument name="id" value="123" />]);
    expect(result).toBe('id: "123"');
  });

  it("renders an argument with a number literal", () => {
    const result = toGraphQLText([<gql.Argument name="limit" value={10} />]);
    expect(result).toBe("limit: 10");
  });

  it("renders an argument with a negative number", () => {
    const result = toGraphQLText([<gql.Argument name="offset" value={-5} />]);
    expect(result).toBe("offset: -5");
  });

  it("renders an argument with a float number", () => {
    const result = toGraphQLText([<gql.Argument name="rating" value={4.5} />]);
    expect(result).toBe("rating: 4.5");
  });

  it("renders an argument with a boolean true", () => {
    const result = toGraphQLText([
      <gql.Argument name="includeDeleted" value={true} />,
    ]);
    expect(result).toBe("includeDeleted: true");
  });

  it("renders an argument with a boolean false", () => {
    const result = toGraphQLText([
      <gql.Argument name="includeDeleted" value={false} />,
    ]);
    expect(result).toBe("includeDeleted: false");
  });

  it("renders an argument with null value", () => {
    const result = toGraphQLText([<gql.Argument name="filter" value={null} />]);
    expect(result).toBe("filter: null");
  });

  it("renders an argument with a Variable reference", () => {
    const result = toGraphQLText([
      <gql.Argument name="id" value={<gql.Variable name="userId" />} />,
    ]);
    expect(result).toBe("id: $userId");
  });

  it("renders an argument with an enum value using refkey", () => {
    const publishedRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status">
          <gql.EnumValue name="PUBLISHED" refkey={publishedRef} />
        </gql.EnumTypeDefinition>
        <gql.Argument name="status" value={code`${publishedRef}`} />
      </>,
    );
    expect(result).toContain("status: PUBLISHED");
  });

  it("renders an argument with an array of primitives", () => {
    const result = toGraphQLText([
      <gql.Argument name="tags" value={["graphql", "typescript", "alloy"]} />,
    ]);
    expect(result).toRenderTo(d`
      tags: ["graphql", "typescript", "alloy"]
    `);
  });

  it("renders an argument with an empty array", () => {
    const result = toGraphQLText([<gql.Argument name="tags" value={[]} />]);
    expect(result).toBe("tags: []");
  });

  it("renders an argument with an array of numbers", () => {
    const result = toGraphQLText([
      <gql.Argument name="scores" value={[1, 2, 3, 4, 5]} />,
    ]);
    expect(result).toRenderTo(d`
      scores: [1, 2, 3, 4, 5]
    `);
  });

  it("renders an argument with a nested object (note: objects should be passed through directives args)", () => {
    // Note: For complex objects in arguments, use Directive args syntax
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        directives={
          <gql.Directive name="filter" args={{ name: "Alice", age: 30 }} />
        }
      />,
    );
    expect(result).toContain('name: "Alice"');
    expect(result).toContain("age: 30");
  });

  it("renders an argument with an empty object through directive", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        directives={<gql.Directive name="config" args={{}} />}
      />,
    );
    expect(result).toBe("user @config");
  });

  it("renders an argument with a complex nested object through directive", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        directives={
          <gql.Directive
            name="validate"
            args={{
              user: {
                name: "Bob",
                email: "bob@example.com",
              },
              settings: {
                notifications: true,
                theme: "dark",
              },
            }}
          />
        }
      />,
    );
    expect(result).toContain('name: "Bob"');
    expect(result).toContain('email: "bob@example.com"');
    expect(result).toContain("notifications: true");
    expect(result).toContain('theme: "dark"');
  });

  it("renders an argument with a mixed-type array", () => {
    const result = toGraphQLText([
      <gql.Argument name="values" value={[1, "two", true, null]} />,
    ]);
    expect(result).toRenderTo(d`
      values: [1, "two", true, null]
    `);
  });

  it("renders multiple arguments in a field", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="users"
        arguments={
          <>
            <gql.Argument name="limit" value={10} />
            <gql.Argument name="offset" value={0} />
            <gql.Argument name="includeDeleted" value={false} />
          </>
        }
      >
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
      </gql.FieldSelection>,
    );
    expect(result).toRenderTo(d`
      users(limit: 10, offset: 0, includeDeleted: false) {
        id
        name
      }
    `);
  });

  it("renders arguments with variables in a field", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        arguments={
          <>
            <gql.Argument name="id" value={<gql.Variable name="userId" />} />
            <gql.Argument
              name="includeEmail"
              value={<gql.Variable name="showEmail" />}
            />
          </>
        }
      >
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
      </gql.FieldSelection>,
    );
    expect(result).toRenderTo(d`
      user(id: $userId, includeEmail: $showEmail) {
        id
        name
      }
    `);
  });

  it("renders arguments in directives", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="email"
        directives={
          <>
            <gql.Directive
              name="include"
              args={{ if: <gql.Variable name="includeEmail" /> }}
            />
            <gql.Directive
              name="deprecated"
              args={{ reason: "Use newEmail" }}
            />
          </>
        }
      />,
    );
    expect(result).toBe(
      'email @include(if: $includeEmail) @deprecated(reason: "Use newEmail")',
    );
  });

  it("renders arguments with special characters in strings", () => {
    const result = toGraphQLText([
      <gql.Argument name="message" value='Hello "World"' />,
    ]);
    expect(result).toBe('message: "Hello \\"World\\""');
  });

  it("renders arguments with strings containing newlines", () => {
    const result = toGraphQLText([
      <gql.Argument name="text" value="line1\nline2" />,
    ]);
    expect(result).toBe('text: "line1\\nline2"');
  });
});
