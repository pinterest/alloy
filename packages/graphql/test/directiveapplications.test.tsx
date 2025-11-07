/** @jsxImportSource @alloy-js/core */
import { code } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("DirectiveApplication", () => {
  it("renders a simple directive without arguments", () => {
    const result = toGraphQLText(<gql.DirectiveApplication name="custom" />);
    expect(result.trim()).toBe("@custom");
  });

  it("renders a directive with a string name", () => {
    const result = toGraphQLText(
      <gql.DirectiveApplication name={builtInDirectives.deprecated} />,
    );
    expect(result.trim()).toBe("@deprecated");
  });

  it("renders a directive with a single argument", () => {
    const result = toGraphQLText(
      <gql.DirectiveApplication
        name={builtInDirectives.deprecated}
        args={{ reason: "Use newField instead" }}
      />,
    );
    expect(result.trim()).toBe('@deprecated(reason: "Use newField instead")');
  });

  it("renders a directive with multiple arguments", () => {
    const result = toGraphQLText(
      <gql.DirectiveApplication
        name="auth"
        args={{ requires: "ADMIN", level: 5 }}
      />,
    );
    expect(result.trim()).toBe('@auth(requires: "ADMIN", level: 5)');
  });

  it("renders a directive on an object type", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration
        name="User"
        directives={
          <gql.DirectiveApplication name="auth" args={{ requires: "USER" }} />
        }
      >
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type User @auth(requires: "USER") {
        id: ID!
      }
    `);
  });

  it("handles complex argument values", () => {
    const result = toGraphQLText(
      <gql.DirectiveApplication
        name="complex"
        args={{
          list: [1, 2, 3],
          nested: { key: "value" },
          flag: true,
        }}
      />,
    );
    expect(result.trim()).toBe(
      '@complex(list: [1, 2, 3], nested: {key: "value"}, flag: true)',
    );
  });

  it("allows same directives on different fields (no scoping conflicts)", () => {
    // Directives don't create symbols, so they can be freely reused across fields
    // This test verifies that multiple fields can have the same directive without interference
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="Query">
        <gql.FieldDeclaration
          name="oldUsers"
          type={code`[User]`}
          directives={
            <gql.DirectiveApplication
              name={builtInDirectives.deprecated}
              args={{ reason: "Use users instead" }}
            />
          }
        />
        <gql.FieldDeclaration
          name="oldPosts"
          type={code`[Post]`}
          directives={
            <gql.DirectiveApplication
              name={builtInDirectives.deprecated}
              args={{ reason: "Use posts instead" }}
            />
          }
        />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type Query {
        oldUsers: [User] @deprecated(reason: "Use users instead")
        oldPosts: [Post] @deprecated(reason: "Use posts instead")
      }
    `);
  });

  it("allows same directive argument names in different directives (no scoping conflicts)", () => {
    // Directive arguments are just key-value pairs, not symbols with scoping
    // This verifies that directive arguments with the same name don't interfere across directives
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="Query">
        <gql.FieldDeclaration
          name="adminUsers"
          type={code`[User]`}
          directives={
            <gql.DirectiveApplication
              name="auth"
              args={{ requires: "ADMIN", level: 5 }}
            />
          }
        />
        <gql.FieldDeclaration
          name="moderatorUsers"
          type={code`[User]`}
          directives={
            <gql.DirectiveApplication
              name="auth"
              args={{ requires: "MODERATOR", level: 3 }}
            />
          }
        />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type Query {
        adminUsers: [User] @auth(requires: "ADMIN", level: 5)
        moderatorUsers: [User] @auth(requires: "MODERATOR", level: 3)
      }
    `);
  });
});
