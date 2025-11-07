/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("DirectiveDeclaration", () => {
  it("renders a simple directive declaration without arguments", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="custom"
        locations={["FIELD_DEFINITION"]}
      />,
    );
    expect(result).toBe("directive @custom on FIELD_DEFINITION");
  });

  it("renders a directive declaration with multiple locations", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="auth"
        locations={["FIELD_DEFINITION", "OBJECT", "INTERFACE"]}
      />,
    );
    expect(result).toBe(
      "directive @auth on FIELD_DEFINITION | OBJECT | INTERFACE",
    );
  });

  it("renders a directive declaration with a single argument", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="deprecated"
        locations={["FIELD_DEFINITION"]}
        args={
          <gql.ArgumentDeclaration
            name="reason"
            type={builtInScalars.String}
            default="No longer supported"
          />
        }
      />,
    );
    expect(result).toBe(
      'directive @deprecated(reason: String = "No longer supported") on FIELD_DEFINITION',
    );
  });

  it("renders a directive declaration with multiple arguments", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="auth"
        locations={["FIELD_DEFINITION", "OBJECT"]}
        args={
          <>
            <gql.ArgumentDeclaration
              name="requires"
              type="Role!"
              default="USER"
              enumDefault
            />
            <gql.ArgumentDeclaration
              name="scopes"
              type={code`[${builtInScalars.String}!]`}
            />
          </>
        }
      />,
    );
    expect(result).toBe(
      "directive @auth(requires: Role! = USER, scopes: [String!]) on FIELD_DEFINITION | OBJECT",
    );
  });

  it("renders a repeatable directive declaration", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="tag"
        repeatable
        locations={["FIELD_DEFINITION", "OBJECT"]}
        args={
          <gql.ArgumentDeclaration
            name="name"
            type={code`${builtInScalars.String}!`}
          />
        }
      />,
    );
    expect(result).toBe(
      "directive @tag(name: String!) repeatable on FIELD_DEFINITION | OBJECT",
    );
  });

  it("renders a directive declaration with documentation", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="validate"
        doc={`"""\nValidates field values against a pattern\n"""`}
        locations={["FIELD_DEFINITION"]}
        args={
          <gql.ArgumentDeclaration
            name="pattern"
            type={code`${builtInScalars.String}!`}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      """
      Validates field values against a pattern
      """
      directive @validate(pattern: String!) on FIELD_DEFINITION
    `);
  });

  it("renders multiple directive declarations in a schema", () => {
    const result = toGraphQLText(
      <>
        <gql.DirectiveDeclaration
          name="auth"
          locations={["FIELD_DEFINITION", "OBJECT"]}
          args={<gql.ArgumentDeclaration name="requires" type="Role!" />}
        />
        <gql.DirectiveDeclaration
          name="rateLimit"
          locations={["FIELD_DEFINITION"]}
          args={
            <>
              <gql.ArgumentDeclaration
                name="limit"
                type={builtInScalars.Int}
                default={100}
              />
              <gql.ArgumentDeclaration
                name="window"
                type={builtInScalars.Int}
                default={60}
              />
            </>
          }
        />
      </>,
    );
    expect(result).toRenderTo(d`
      directive @auth(requires: Role!) on FIELD_DEFINITION | OBJECT
      
      directive @rateLimit(limit: Int = 100, window: Int = 60) on FIELD_DEFINITION
    `);
  });

  it("allows same argument names in different directive declarations (checks correct scoping)", () => {
    // Each directive should have its own argument scope
    const result = toGraphQLText(
      <>
        <gql.DirectiveDeclaration
          name="auth"
          locations={["FIELD_DEFINITION"]}
          args={
            <>
              <gql.ArgumentDeclaration name="requires" type="Role!" />
              <gql.ArgumentDeclaration
                name="level"
                type={builtInScalars.Int}
                default={1}
              />
            </>
          }
        />
        <gql.DirectiveDeclaration
          name="permission"
          locations={["OBJECT"]}
          args={
            <>
              <gql.ArgumentDeclaration name="requires" type="Permission!" />
              <gql.ArgumentDeclaration
                name="level"
                type={builtInScalars.Int}
                default={5}
              />
            </>
          }
        />
      </>,
    );
    expect(result).toRenderTo(d`
      directive @auth(requires: Role!, level: Int = 1) on FIELD_DEFINITION
      
      directive @permission(requires: Permission!, level: Int = 5) on OBJECT
    `);
  });

  it("renders directive declaration with all executable directive locations", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="trace"
        locations={[
          "QUERY",
          "MUTATION",
          "SUBSCRIPTION",
          "FIELD",
          "FRAGMENT_DEFINITION",
          "FRAGMENT_SPREAD",
          "INLINE_FRAGMENT",
          "VARIABLE_DEFINITION",
        ]}
      />,
    );
    expect(result).toBe(
      "directive @trace on QUERY | MUTATION | SUBSCRIPTION | FIELD | FRAGMENT_DEFINITION | FRAGMENT_SPREAD | INLINE_FRAGMENT | VARIABLE_DEFINITION",
    );
  });

  it("renders directive declaration with all type system directive locations", () => {
    const result = toGraphQLText(
      <gql.DirectiveDeclaration
        name="metadata"
        locations={[
          "SCHEMA",
          "SCALAR",
          "OBJECT",
          "FIELD_DEFINITION",
          "ARGUMENT_DEFINITION",
          "INTERFACE",
          "UNION",
          "ENUM",
          "ENUM_VALUE",
          "INPUT_OBJECT",
          "INPUT_FIELD_DEFINITION",
        ]}
      />,
    );
    expect(result).toBe(
      "directive @metadata on SCHEMA | SCALAR | OBJECT | FIELD_DEFINITION | ARGUMENT_DEFINITION | INTERFACE | UNION | ENUM | ENUM_VALUE | INPUT_OBJECT | INPUT_FIELD_DEFINITION",
    );
  });

  it("allows using a declared directive with refkey when applying it", () => {
    const authDirectiveRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.DirectiveDeclaration
          name="auth"
          refkey={authDirectiveRef}
          locations={["FIELD_DEFINITION", "OBJECT"]}
          args={
            <>
              <gql.ArgumentDeclaration
                name="requires"
                type="Role!"
                default="USER"
                enumDefault
              />
              <gql.ArgumentDeclaration
                name="level"
                type={builtInScalars.Int}
                default={1}
              />
            </>
          }
        />
        <gql.ObjectTypeDeclaration
          name="User"
          directives={
            <gql.DirectiveApplication
              name={authDirectiveRef}
              args={{ requires: "ADMIN", level: 5 }}
            />
          }
        >
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration
            name="sensitiveData"
            type={builtInScalars.String}
            directives={
              <gql.DirectiveApplication
                name={authDirectiveRef}
                args={{ requires: "SUPER_ADMIN", level: 10 }}
              />
            }
          />
        </gql.ObjectTypeDeclaration>
      </>,
    );

    expect(result).toRenderTo(d`
      directive @auth(requires: Role! = USER, level: Int = 1) on FIELD_DEFINITION | OBJECT

      type User @auth(requires: "ADMIN", level: 5) {
        id: ID!
        sensitiveData: String @auth(requires: "SUPER_ADMIN", level: 10)
      }
    `);
  });
});
