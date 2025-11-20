/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Variable Type Validation", () => {
  describe("Valid variable types (input types)", () => {
    it("allows scalar types for variables", () => {
      const result = toGraphQLText(
        <gql.OperationDefinition
          operationType="query"
          name="GetUser"
          variableDefinitions={
            <>
              <gql.VariableDefinition name="id" type={gql.builtInScalars.ID} />
              <gql.VariableDefinition
                name="name"
                type={gql.builtInScalars.String}
              />
            </>
          }
        >
          <gql.FieldSelection name="user">
            <gql.FieldSelection name="id" />
          </gql.FieldSelection>
        </gql.OperationDefinition>,
      );

      expect(result).toContain("$id: ID");
      expect(result).toContain("$name: String");
    });

    it("allows enum types for variables", () => {
      const statusRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
            <gql.EnumValue name="ACTIVE" />
            <gql.EnumValue name="INACTIVE" />
          </gql.EnumTypeDefinition>
          <gql.OperationDefinition
            operationType="query"
            name="GetUsers"
            variableDefinitions={
              <gql.VariableDefinition name="status" type={statusRef} />
            }
          >
            <gql.FieldSelection name="users">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>
        </>,
      );

      expect(result).toContain("$status: Status");
    });

    it("allows input object types for variables", () => {
      const userInputRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InputObjectTypeDefinition name="UserInput" refkey={userInputRef}>
            <gql.InputFieldDeclaration
              name="name"
              type={gql.builtInScalars.String}
            />
            <gql.InputFieldDeclaration
              name="email"
              type={gql.builtInScalars.String}
            />
          </gql.InputObjectTypeDefinition>
          <gql.OperationDefinition
            operationType="mutation"
            name="CreateUser"
            variableDefinitions={
              <gql.VariableDefinition
                name="input"
                type={code`${userInputRef}!`}
              />
            }
          >
            <gql.FieldSelection name="createUser">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>
        </>,
      );

      expect(result).toContain("$input: UserInput!");
    });
  });

  describe("Invalid variable types (output types)", () => {
    it("throws error when object type is used for variable", () => {
      const userRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ObjectTypeDefinition name="User" refkey={userRef}>
              <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            </gql.ObjectTypeDefinition>
            <gql.OperationDefinition
              operationType="query"
              name="InvalidQuery"
              variableDefinitions={
                <gql.VariableDefinition name="user" type={userRef} />
              }
            >
              <gql.FieldSelection name="something">
                <gql.FieldSelection name="id" />
              </gql.FieldSelection>
            </gql.OperationDefinition>
          </>,
        );
      }).toThrow(/Variable "user" cannot use object type "User"/);
    });

    it("throws error when interface type is used for variable", () => {
      const nodeRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
              <gql.FieldDefinition
                name="id"
                type={code`${gql.builtInScalars.ID}!`}
              />
            </gql.InterfaceTypeDefinition>
            <gql.OperationDefinition
              operationType="query"
              name="InvalidQuery"
              variableDefinitions={
                <gql.VariableDefinition name="node" type={nodeRef} />
              }
            >
              <gql.FieldSelection name="something">
                <gql.FieldSelection name="id" />
              </gql.FieldSelection>
            </gql.OperationDefinition>
          </>,
        );
      }).toThrow(/Variable "node" cannot use interface type "Node"/);
    });

    it("throws error when union type is used for variable", () => {
      const searchResultRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.UnionTypeDefinition
              name="SearchResult"
              refkey={searchResultRef}
              members={["User", "Post"]}
            />
            <gql.OperationDefinition
              operationType="query"
              name="InvalidQuery"
              variableDefinitions={
                <gql.VariableDefinition name="result" type={searchResultRef} />
              }
            >
              <gql.FieldSelection name="something">
                <gql.FieldSelection name="id" />
              </gql.FieldSelection>
            </gql.OperationDefinition>
          </>,
        );
      }).toThrow(/Variable "result" cannot use union type "SearchResult"/);
    });
  });

  describe("Variable default value validation", () => {
    it("allows null default for nullable variable", () => {
      const result = toGraphQLText(
        <gql.OperationDefinition
          operationType="query"
          name="GetUser"
          variableDefinitions={
            <gql.VariableDefinition
              name="id"
              type={gql.builtInScalars.ID}
              defaultValue={null}
            />
          }
        >
          <gql.FieldSelection name="user">
            <gql.FieldSelection name="id" />
          </gql.FieldSelection>
        </gql.OperationDefinition>,
      );

      expect(result).toContain("$id: ID = null");
    });

    it("allows non-null default for non-null variable", () => {
      const result = toGraphQLText(
        <gql.OperationDefinition
          operationType="query"
          name="GetUsers"
          variableDefinitions={
            <gql.VariableDefinition
              name="limit"
              type={code`${gql.builtInScalars.Int}!`}
              defaultValue={10}
            />
          }
        >
          <gql.FieldSelection name="users">
            <gql.FieldSelection name="id" />
          </gql.FieldSelection>
        </gql.OperationDefinition>,
      );

      expect(result).toContain("$limit: Int! = 10");
    });

    it("throws error when null default is used for non-null variable", () => {
      expect(() => {
        toGraphQLText(
          <gql.OperationDefinition
            operationType="query"
            name="InvalidQuery"
            variableDefinitions={
              <gql.VariableDefinition
                name="id"
                type={code`${gql.builtInScalars.ID}!`}
                defaultValue={null}
              />
            }
          >
            <gql.FieldSelection name="user">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>,
        );
      }).toThrow(/Variable "id" has a non-null type but a null default value/);
    });
  });

  describe("Variable name uniqueness", () => {
    it("allows unique variable names in an operation", () => {
      const result = toGraphQLText(
        <gql.OperationDefinition
          operationType="query"
          name="GetUser"
          variableDefinitions={
            <>
              <gql.VariableDefinition name="id" type={gql.builtInScalars.ID} />
              <gql.VariableDefinition
                name="limit"
                type={gql.builtInScalars.Int}
              />
              <gql.VariableDefinition
                name="includeDeleted"
                type={gql.builtInScalars.Boolean}
              />
            </>
          }
        >
          <gql.FieldSelection name="user">
            <gql.FieldSelection name="id" />
          </gql.FieldSelection>
        </gql.OperationDefinition>,
      );

      expect(result).toContain("$id: ID");
      expect(result).toContain("$limit: Int");
      expect(result).toContain("$includeDeleted: Boolean");
    });

    it("throws error when duplicate variable names are used in an operation", () => {
      expect(() => {
        toGraphQLText(
          <gql.OperationDefinition
            operationType="query"
            name="InvalidQuery"
            variableDefinitions={
              <>
                <gql.VariableDefinition
                  name="id"
                  type={gql.builtInScalars.ID}
                />
                <gql.VariableDefinition
                  name="id"
                  type={gql.builtInScalars.String}
                />
              </>
            }
          >
            <gql.FieldSelection name="user">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>,
        );
      }).toThrow(/Duplicate member name "id"/);
    });

    it("throws error with descriptive message for duplicate variables", () => {
      expect(() => {
        toGraphQLText(
          <gql.OperationDefinition
            operationType="mutation"
            name="CreatePost"
            variableDefinitions={
              <>
                <gql.VariableDefinition
                  name="title"
                  type={gql.builtInScalars.String}
                />
                <gql.VariableDefinition
                  name="title"
                  type={gql.builtInScalars.String}
                />
              </>
            }
          >
            <gql.FieldSelection name="createPost">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>,
        );
      }).toThrow(/Duplicate member name "title" in CreatePost/);
    });

    it("allows same variable name in different operations", () => {
      const result = toGraphQLText(
        <>
          <gql.OperationDefinition
            operationType="query"
            name="GetUser"
            variableDefinitions={
              <gql.VariableDefinition name="id" type={gql.builtInScalars.ID} />
            }
          >
            <gql.FieldSelection name="user">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>
          <gql.OperationDefinition
            operationType="query"
            name="GetPost"
            variableDefinitions={
              <gql.VariableDefinition name="id" type={gql.builtInScalars.ID} />
            }
          >
            <gql.FieldSelection name="post">
              <gql.FieldSelection name="id" />
            </gql.FieldSelection>
          </gql.OperationDefinition>
        </>,
      );

      expect(result).toContain("query GetUser($id: ID)");
      expect(result).toContain("query GetPost($id: ID)");
    });
  });
});
