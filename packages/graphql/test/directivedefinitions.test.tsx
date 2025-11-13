/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("DirectiveDefinition", () => {
  it("renders a simple directive declaration without arguments", () => {
    const result = toGraphQLText(
      <gql.DirectiveDefinition
        name="custom"
        locations={["FIELD_DEFINITION"]}
      />,
    );
    expect(result).toBe("directive @custom on FIELD_DEFINITION");
  });

  it("renders a directive declaration with multiple locations", () => {
    const result = toGraphQLText(
      <gql.DirectiveDefinition
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
      <gql.DirectiveDefinition
        name="deprecated"
        locations={["FIELD_DEFINITION"]}
        args={
          <gql.InputValueDefinition
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
      <gql.DirectiveDefinition
        name="auth"
        locations={["FIELD_DEFINITION", "OBJECT"]}
        args={
          <>
            <gql.InputValueDefinition
              name="requires"
              type="Role!"
              default={1}
            />
            <gql.InputValueDefinition
              name="scopes"
              type={code`[${builtInScalars.String}!]`}
            />
          </>
        }
      />,
    );
    expect(result).toBe(
      "directive @auth(requires: Role! = 1, scopes: [String!]) on FIELD_DEFINITION | OBJECT",
    );
  });

  it("renders a repeatable directive declaration", () => {
    const result = toGraphQLText(
      <gql.DirectiveDefinition
        name="tag"
        repeatable
        locations={["FIELD_DEFINITION", "OBJECT"]}
        args={
          <gql.InputValueDefinition
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
      <gql.DirectiveDefinition
        name="validate"
        doc={`"""\nValidates field values against a pattern\n"""`}
        locations={["FIELD_DEFINITION"]}
        args={
          <gql.InputValueDefinition
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
        <gql.DirectiveDefinition
          name="auth"
          locations={["FIELD_DEFINITION", "OBJECT"]}
          args={<gql.InputValueDefinition name="requires" type="Role!" />}
        />
        <gql.DirectiveDefinition
          name="rateLimit"
          locations={["FIELD_DEFINITION"]}
          args={
            <>
              <gql.InputValueDefinition
                name="limit"
                type={builtInScalars.Int}
                default={100}
              />
              <gql.InputValueDefinition
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
        <gql.DirectiveDefinition
          name="auth"
          locations={["FIELD_DEFINITION"]}
          args={
            <>
              <gql.InputValueDefinition name="requires" type="Role!" />
              <gql.InputValueDefinition
                name="level"
                type={builtInScalars.Int}
                default={1}
              />
            </>
          }
        />
        <gql.DirectiveDefinition
          name="permission"
          locations={["OBJECT"]}
          args={
            <>
              <gql.InputValueDefinition name="requires" type="Permission!" />
              <gql.InputValueDefinition
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
      <gql.DirectiveDefinition
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
      <gql.DirectiveDefinition
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
        <gql.DirectiveDefinition
          name="auth"
          refkey={authDirectiveRef}
          locations={["FIELD_DEFINITION", "OBJECT"]}
          args={
            <>
              <gql.InputValueDefinition
                name="requires"
                type="Role!"
                default={1}
              />
              <gql.InputValueDefinition
                name="level"
                type={builtInScalars.Int}
                default={1}
              />
            </>
          }
        />
        <gql.ObjectTypeDefinition
          name="User"
          directives={
            <gql.Directive
              name={authDirectiveRef}
              args={{ requires: "ADMIN", level: 5 }}
            />
          }
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="sensitiveData"
            type={builtInScalars.String}
            directives={
              <gql.Directive
                name={authDirectiveRef}
                args={{ requires: "SUPER_ADMIN", level: 10 }}
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      directive @auth(requires: Role! = 1, level: Int = 1) on FIELD_DEFINITION | OBJECT

      type User @auth(requires: "ADMIN", level: 5) {
        id: ID!
        sensitiveData: String @auth(requires: "SUPER_ADMIN", level: 10)
      }
    `);
  });
});
