import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { builtInDirectives, builtInScalars } from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("@oneOf Input Object Validation", () => {
  it("renders a valid @oneOf input object with nullable fields", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition
        name="SearchFilter"
        isOneOf
        directives={<gql.Directive name={builtInDirectives.oneOf} />}
      >
        <gql.InputFieldDeclaration
          name="name"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
        <gql.InputFieldDeclaration
          name="email"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
      </gql.InputObjectTypeDefinition>,
    );

    expect(result).toRenderTo(d`
      input SearchFilter @oneOf {
        name: String
        email: String
      }
    `);
  });

  it("throws error when @oneOf input field is non-nullable", () => {
    expect(() => {
      toGraphQLText(
        <gql.InputObjectTypeDefinition
          name="SearchFilter"
          isOneOf
          directives={<gql.Directive name={builtInDirectives.oneOf} />}
        >
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
        </gql.InputObjectTypeDefinition>,
      );
    }).toThrow(/Input field "name" in a @oneOf input object must be nullable/);
  });

  it("throws error when @oneOf input field has a default value", () => {
    expect(() => {
      toGraphQLText(
        <gql.InputObjectTypeDefinition
          name="SearchFilter"
          isOneOf
          directives={<gql.Directive name={builtInDirectives.oneOf} />}
        >
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} />}
            defaultValue="default"
          />
        </gql.InputObjectTypeDefinition>,
      );
    }).toThrow(
      /Input field "name" in a @oneOf input object cannot have a default value/,
    );
  });

  it("throws error for non-nullable field with complex type", () => {
    expect(() => {
      toGraphQLText(
        <gql.InputObjectTypeDefinition
          name="Filter"
          isOneOf
          directives={<gql.Directive name={builtInDirectives.oneOf} />}
        >
          <gql.InputFieldDeclaration
            name="ids"
            type={
              <gql.TypeReference
                type={<gql.TypeReference type={builtInScalars.ID} required />}
                list
                required
              />
            }
          />
        </gql.InputObjectTypeDefinition>,
      );
    }).toThrow(/Input field "ids" in a @oneOf input object must be nullable/);
  });

  it("allows nullable list types in @oneOf", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition
        name="Filter"
        isOneOf
        directives={<gql.Directive name={builtInDirectives.oneOf} />}
      >
        <gql.InputFieldDeclaration
          name="ids"
          type={
            <gql.TypeReference
              type={<gql.TypeReference type={builtInScalars.ID} required />}
              list
            />
          }
        />
      </gql.InputObjectTypeDefinition>,
    );

    expect(result).toRenderTo(d`
      input Filter @oneOf {
        ids: [ID!]
      }
    `);
  });

  it("allows multiple nullable fields in @oneOf", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition
        name="SearchBy"
        isOneOf
        directives={<gql.Directive name={builtInDirectives.oneOf} />}
      >
        <gql.InputFieldDeclaration
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} />}
        />
        <gql.InputFieldDeclaration
          name="email"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
        <gql.InputFieldDeclaration
          name="username"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
      </gql.InputObjectTypeDefinition>,
    );

    expect(result).toRenderTo(d`
      input SearchBy @oneOf {
        id: ID
        email: String
        username: String
      }
    `);
  });

  it("does not validate fields in regular input objects", () => {
    // Should not throw - non-@oneOf input objects can have non-nullable fields and defaults
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="UserInput">
        <gql.InputFieldDeclaration
          name="name"
          type={<gql.TypeReference type={builtInScalars.String} required />}
        />
        <gql.InputFieldDeclaration
          name="age"
          type={<gql.TypeReference type={builtInScalars.Int} />}
          defaultValue={0}
        />
      </gql.InputObjectTypeDefinition>,
    );

    expect(result).toRenderTo(d`
      input UserInput {
        name: String!
        age: Int = 0
      }
    `);
  });
});
