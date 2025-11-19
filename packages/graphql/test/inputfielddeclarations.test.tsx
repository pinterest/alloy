/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("InputFieldDeclaration", () => {
  it("renders a simple field with optional type", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="UserInput">
        <gql.InputFieldDeclaration name="name" type={builtInScalars.String} />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input UserInput {
        name: String
      }
    `);
  });

  it("renders a field with required type", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="UserInput">
        <gql.InputFieldDeclaration
          name="email"
          type={code`${builtInScalars.String}!`}
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input UserInput {
        email: String!
      }
    `);
  });

  it("renders a field with list type", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="BatchInput">
        <gql.InputFieldDeclaration
          name="ids"
          type={code`[${builtInScalars.ID}!]!`}
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input BatchInput {
        ids: [ID!]!
      }
    `);
  });

  it("renders a field with documentation", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="UserInput">
        <gql.InputFieldDeclaration
          name="age"
          type={builtInScalars.Int}
          description="User's age in years"
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input UserInput {
        """
        User's age in years
        """
        age: Int
      }
    `);
  });

  it("renders fields with various default value types", () => {
    const statusRef = refkey();
    const activeRef = refkey();
    const configRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" refkey={activeRef} />
          <gql.EnumValue name="INACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.InputObjectTypeDefinition name="Config" refkey={configRef}>
          <gql.InputFieldDeclaration name="key" type={builtInScalars.String} />
          <gql.InputFieldDeclaration name="count" type={builtInScalars.Int} />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="DefaultValuesInput">
          <gql.InputFieldDeclaration
            name="numberDefault"
            type={builtInScalars.Int}
            defaultValue={10}
          />
          <gql.InputFieldDeclaration
            name="stringDefault"
            type={builtInScalars.String}
            defaultValue="development"
          />
          <gql.InputFieldDeclaration
            name="booleanDefault"
            type={builtInScalars.Boolean}
            defaultValue={false}
          />
          <gql.InputFieldDeclaration
            name="nullDefault"
            type={builtInScalars.String}
            defaultValue={null}
          />
          <gql.InputFieldDeclaration
            name="enumDefault"
            type={code`${statusRef}!`}
            defaultValue={code`${activeRef}`}
          />
          <gql.InputFieldDeclaration
            name="arrayDefault"
            type={code`[${builtInScalars.String}!]!`}
            defaultValue={["tag1", "tag2"]}
          />
          <gql.InputFieldDeclaration
            name="emptyArrayDefault"
            type={code`[${builtInScalars.String}!]!`}
            defaultValue={[]}
          />
          <gql.InputFieldDeclaration
            name="objectDefault"
            type={configRef}
            defaultValue={{ key: "value", count: 42 }}
          />
        </gql.InputObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        INACTIVE
      }
      
      input Config {
        key: String
        count: Int
      }
      
      input DefaultValuesInput {
        numberDefault: Int = 10
        stringDefault: String = "development"
        booleanDefault: Boolean = false
        nullDefault: String = null
        enumDefault: Status! = ACTIVE
        arrayDefault: [String!]! = ["tag1", "tag2"]
        emptyArrayDefault: [String!]! = []
        objectDefault: Config = {key: "value", count: 42}
      }
    `);
  });

  it("renders a field with a directive", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="LegacyInput">
        <gql.InputFieldDeclaration
          name="oldField"
          type={builtInScalars.String}
          directives={
            <gql.Directive
              name={builtInDirectives.deprecated}
              args={{ reason: "Use newField instead" }}
            />
          }
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input LegacyInput {
        oldField: String @deprecated(reason: "Use newField instead")
      }
    `);
  });

  it("renders a field with multiple directives", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="CustomInput">
        <gql.InputFieldDeclaration
          name="field"
          type={builtInScalars.String}
          directives={
            <>
              <gql.Directive name="validate" args={{ pattern: ".*" }} />
              <gql.Directive name="sensitive" />
            </>
          }
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input CustomInput {
        field: String @validate(pattern: ".*") @sensitive
      }
    `);
  });

  it("renders a field with documentation, default, and directive", () => {
    const activeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status">
          <gql.EnumValue name="ACTIVE" refkey={activeRef} />
        </gql.EnumTypeDefinition>
        <gql.InputObjectTypeDefinition name="ComplexInput">
          <gql.InputFieldDeclaration
            name="status"
            type="Status!"
            description="Current status of the entity"
            defaultValue={code`${activeRef}`}
            directives={
              <gql.Directive name="validate" args={{ required: true }} />
            }
          />
        </gql.InputObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
      }
      
      input ComplexInput {
        """
        Current status of the entity
        """
        status: Status! = ACTIVE @validate(required: true)
      }
    `);
  });

  it("renders fields with different scalar types", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeDefinition name="AllTypesInput">
        <gql.InputFieldDeclaration name="id" type={builtInScalars.ID} />
        <gql.InputFieldDeclaration name="count" type={builtInScalars.Int} />
        <gql.InputFieldDeclaration name="price" type={builtInScalars.Float} />
        <gql.InputFieldDeclaration name="name" type={builtInScalars.String} />
        <gql.InputFieldDeclaration
          name="active"
          type={builtInScalars.Boolean}
        />
      </gql.InputObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      input AllTypesInput {
        id: ID
        count: Int
        price: Float
        name: String
        active: Boolean
      }
    `);
  });

  it("renders a field with custom type reference using refkey", () => {
    const userInputRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InputObjectTypeDefinition name="UserInput" refkey={userInputRef}>
          <gql.InputFieldDeclaration name="name" type={builtInScalars.String} />
        </gql.InputObjectTypeDefinition>
        <gql.InputObjectTypeDefinition name="CreatePostInput">
          <gql.InputFieldDeclaration name="author" type={userInputRef} />
        </gql.InputObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      input UserInput {
        name: String
      }
      
      input CreatePostInput {
        author: UserInput
      }
    `);
  });
});
