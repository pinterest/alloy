import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import {
  assertFileContents,
  toGraphQLText,
  toGraphQLTextMultiple,
} from "./utils.jsx";

describe("InputObjectTypeDefinition", () => {
  it("renders a simple input type with multiple fields", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="CreateUserInput">
        <gql.InputFieldDeclaration
          name="name"
          type={<gql.TypeReference type={builtInScalars.String} required />}
        />
        <gql.InputFieldDeclaration
          name="email"
          type={<gql.TypeReference type={builtInScalars.String} required />}
        />
        <gql.InputFieldDeclaration
          name="age"
          type={<gql.TypeReference type={builtInScalars.Int} />}
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input CreateUserInput {
        name: String!
        email: String!
        age: Int
      }
    `);
  });

  it("renders an input type with documentation on the type", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition
        name="CreateUserInput"
        description="Input for creating a new user"
      >
        <gql.InputFieldDeclaration
          name="name"
          type={<gql.TypeReference type={builtInScalars.String} required />}
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      """
      Input for creating a new user
      """
      input CreateUserInput {
        name: String!
      }
    `);
  });

  it("renders an input type with a directive on the type", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition
        name="FilterInput"
        directives={<gql.Directive name="oneOf" />}
      >
        <gql.InputFieldDeclaration
          name="nameContains"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
        <gql.InputFieldDeclaration
          name="emailEquals"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input FilterInput @oneOf {
        nameContains: String
        emailEquals: String
      }
    `);
  });

  it("renders nested input types", () => {
    const addressInputRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InputObjectTypeDefinition
          name="AddressInput"
          refkey={addressInputRef}
        >
          <gql.InputFieldDeclaration
            name="street"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.InputFieldDeclaration
            name="city"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.InputFieldDeclaration
            name="zipCode"
            type={<gql.TypeReference type={builtInScalars.String} />}
          />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="CreateUserInput">
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.InputFieldDeclaration
            name="address"
            type={<gql.TypeReference type={addressInputRef} required />}
          />
        </gql.InputObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      input AddressInput {
        street: String!
        city: String!
        zipCode: String
      }
      
      input CreateUserInput {
        name: String!
        address: AddressInput!
      }
    `);
  });

  it("supports cross-file input references", () => {
    const createUserInputRef = refkey();

    const res = toGraphQLTextMultiple([
      <gql.SourceFile path="inputs.graphql">
        <gql.InputObjectTypeDefinition
          name="CreateUserInput"
          refkey={createUserInputRef}
        >
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.InputFieldDeclaration
            name="email"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
        </gql.InputObjectTypeDefinition>
      </gql.SourceFile>,
      <gql.SourceFile path="mutations.graphql">
        <gql.ObjectTypeDefinition name="Mutation">
          <gql.FieldDefinition
            name="createUser"
            type={<gql.TypeReference type="User" required />}
            args={
              <gql.InputValueDefinition
                name="data"
                type={<gql.TypeReference type={createUserInputRef} required />}
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </gql.SourceFile>,
    ]);

    assertFileContents(res, {
      "inputs.graphql": `
        input CreateUserInput {
          name: String!
          email: String!
        }
      `,
      "mutations.graphql": `
        type Mutation {
          createUser(data: CreateUserInput!): User!
        }
      `,
    });
  });

  it("renders multiple input types in sequence", () => {
    const result = toGraphQLText(
      <>
        <gql.InputObjectTypeDefinition name="CreateUserInput">
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="UpdateUserInput">
          <gql.InputFieldDeclaration
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} />}
          />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="DeleteUserInput">
          <gql.InputFieldDeclaration
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.InputObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      input CreateUserInput {
        name: String!
      }
      
      input UpdateUserInput {
        id: ID!
        name: String
      }
      
      input DeleteUserInput {
        id: ID!
      }
    `);
  });

  it("renders a complex nested input structure", () => {
    const filterInputRef = refkey();
    const sortInputRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InputObjectTypeDefinition
          name="FilterInput"
          refkey={filterInputRef}
        >
          <gql.InputFieldDeclaration
            name="nameContains"
            type={<gql.TypeReference type={builtInScalars.String} />}
          />
          <gql.InputFieldDeclaration
            name="ageGreaterThan"
            type={<gql.TypeReference type={builtInScalars.Int} />}
          />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="SortInput" refkey={sortInputRef}>
          <gql.InputFieldDeclaration
            name="field"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.InputFieldDeclaration
            name="ascending"
            type={<gql.TypeReference type={builtInScalars.Boolean} />}
            defaultValue={true}
          />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="QueryUsersInput">
          <gql.InputFieldDeclaration
            name="filter"
            type={<gql.TypeReference type={filterInputRef} />}
          />
          <gql.InputFieldDeclaration
            name="sort"
            type={<gql.TypeReference type={sortInputRef} />}
          />
          <gql.InputFieldDeclaration
            name="limit"
            type={<gql.TypeReference type={builtInScalars.Int} />}
            defaultValue={10}
          />
        </gql.InputObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      input FilterInput {
        nameContains: String
        ageGreaterThan: Int
      }
      
      input SortInput {
        field: String!
        ascending: Boolean = true
      }
      
      input QueryUsersInput {
        filter: FilterInput
        sort: SortInput
        limit: Int = 10
      }
    `);
  });

  it("renders an empty input type", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="EmptyInput" />,
    );
    expect(result).toRenderTo(d`
      input EmptyInput {

      }
    `);
  });

  it("renders an input type with refkey", () => {
    const inputRef = refkey();
    const userRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} />}
          />
        </gql.ObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="UserInput" refkey={inputRef}>
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} />}
          />
        </gql.InputObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Mutation">
          <gql.FieldDefinition
            name="createUser"
            type={<gql.TypeReference type={userRef} />}
            args={
              <gql.InputValueDefinition
                name="data"
                type={<gql.TypeReference type={inputRef} required />}
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      type User {
        id: ID
      }
      
      input UserInput {
        name: String
      }
      
      type Mutation {
        createUser(data: UserInput!): User
      }
    `);
  });

  it("renders an input type with documentation and directive combined", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition
        name="SearchFilter"
        description="Filters for search queries"
        directives={<gql.Directive name="oneOf" />}
      >
        <gql.InputFieldDeclaration
          name="byName"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
        <gql.InputFieldDeclaration
          name="byEmail"
          type={<gql.TypeReference type={builtInScalars.String} />}
        />
      </gql.InputObjectTypeDefinition>,
    );

    expect(result).toRenderTo(d`
      """
      Filters for search queries
      """
      input SearchFilter @oneOf {
        byName: String
        byEmail: String
      }
    `);
  });
});
