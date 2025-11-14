/** @jsxImportSource @alloy-js/core */
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Variable", () => {
  it("renders a simple variable reference", () => {
    const result = toGraphQLText([<gql.Variable name="userId" />]);
    expect(result).toBe("$userId");
  });

  it("renders a variable with camelCase name", () => {
    const result = toGraphQLText([<gql.Variable name="includeDeleted" />]);
    expect(result).toBe("$includeDeleted");
  });

  it("renders a variable with underscores", () => {
    const result = toGraphQLText([<gql.Variable name="user_id" />]);
    expect(result).toBe("$user_id");
  });

  it("renders a variable in an argument", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        arguments={
          <gql.Argument name="id" value={<gql.Variable name="userId" />} />
        }
      >
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
      </gql.FieldSelection>,
    );
    expect(result).toRenderTo(d`
      user(id: $userId) {
        id
        name
      }
    `);
  });

  it("renders multiple variables in field arguments", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="posts"
        arguments={
          <>
            <gql.Argument name="limit" value={<gql.Variable name="limit" />} />
            <gql.Argument
              name="offset"
              value={<gql.Variable name="offset" />}
            />
            <gql.Argument
              name="status"
              value={<gql.Variable name="status" />}
            />
          </>
        }
      >
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="title" />
      </gql.FieldSelection>,
    );
    expect(result).toRenderTo(d`
      posts(limit: $limit, offset: $offset, status: $status) {
        id
        title
      }
    `);
  });

  it("renders a variable in a directive", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="email"
        directives={
          <gql.Directive
            name="include"
            args={{ if: <gql.Variable name="includeEmail" /> }}
          />
        }
      />,
    );
    expect(result).toBe("email @include(if: $includeEmail)");
  });

  it("renders a variable in @skip directive", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="secretField"
        directives={
          <gql.Directive
            name="skip"
            args={{ if: <gql.Variable name="hideSecret" /> }}
          />
        }
      />,
    );
    expect(result).toBe("secretField @skip(if: $hideSecret)");
  });

  it("renders variables in a complete operation", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="GetUser"
        variableDefinitions={
          <>
            <gql.VariableDefinition name="id" type={builtInScalars.ID} />
            <gql.VariableDefinition
              name="includeEmail"
              type={builtInScalars.Boolean}
              defaultValue={false}
            />
          </>
        }
      >
        <gql.FieldSelection
          name="user"
          arguments={
            <gql.Argument name="id" value={<gql.Variable name="id" />} />
          }
        >
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
          <gql.FieldSelection
            name="email"
            directives={
              <gql.Directive
                name="include"
                args={{ if: <gql.Variable name="includeEmail" /> }}
              />
            }
          />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query GetUser($id: ID, $includeEmail: Boolean = false) {
        user(id: $id) {
          id
          name
          email @include(if: $includeEmail)
        }
      }
    `);
  });

  it("renders variables in mutation operations", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="mutation"
        name="CreateUser"
        variableDefinitions={
          <>
            <gql.VariableDefinition
              name="name"
              type={`${builtInScalars.String}!`}
            />
            <gql.VariableDefinition
              name="email"
              type={`${builtInScalars.String}!`}
            />
          </>
        }
      >
        <gql.FieldSelection
          name="createUser"
          arguments={
            <>
              <gql.Argument name="name" value={<gql.Variable name="name" />} />
              <gql.Argument
                name="email"
                value={<gql.Variable name="email" />}
              />
            </>
          }
        >
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
          <gql.FieldSelection name="email" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      mutation CreateUser($name: String!, $email: String!) {
        createUser(name: $name, email: $email) {
          id
          name
          email
        }
      }
    `);
  });

  it("renders variables with complex object arguments", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="mutation"
        name="UpdateUser"
        variableDefinitions={
          <gql.VariableDefinition name="input" type="UserInput!" />
        }
      >
        <gql.FieldSelection
          name="updateUser"
          arguments={
            <gql.Argument name="input" value={<gql.Variable name="input" />} />
          }
        >
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      mutation UpdateUser($input: UserInput!) {
        updateUser(input: $input) {
          id
          name
        }
      }
    `);
  });

  it("renders variables in inline fragments with directives", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="GetItem"
        variableDefinitions={
          <gql.VariableDefinition
            name="showDetails"
            type={builtInScalars.Boolean}
            defaultValue={false}
          />
        }
      >
        <gql.FieldSelection name="item">
          <gql.FieldSelection name="id" />
          <gql.InlineFragment
            directives={
              <gql.Directive
                name="include"
                args={{ if: <gql.Variable name="showDetails" /> }}
              />
            }
          >
            <gql.FieldSelection name="details" />
          </gql.InlineFragment>
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query GetItem($showDetails: Boolean = false) {
        item {
          id
          ... @include(if: $showDetails) {
            details
          }
        }
      }
    `);
  });

  it("renders multiple variables with different default values", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="SearchPosts"
        variableDefinitions={
          <>
            <gql.VariableDefinition
              name="query"
              type={builtInScalars.String}
              defaultValue="default"
            />
            <gql.VariableDefinition
              name="limit"
              type={builtInScalars.Int}
              defaultValue={10}
            />
            <gql.VariableDefinition
              name="includeDeleted"
              type={builtInScalars.Boolean}
              defaultValue={false}
            />
          </>
        }
      >
        <gql.FieldSelection
          name="posts"
          arguments={
            <>
              <gql.Argument
                name="query"
                value={<gql.Variable name="query" />}
              />
              <gql.Argument
                name="limit"
                value={<gql.Variable name="limit" />}
              />
              <gql.Argument
                name="includeDeleted"
                value={<gql.Variable name="includeDeleted" />}
              />
            </>
          }
        >
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="title" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query SearchPosts($query: String = "default", $limit: Int = 10, $includeDeleted: Boolean = false) {
        posts(query: $query, limit: $limit, includeDeleted: $includeDeleted) {
          id
          title
        }
      }
    `);
  });
});
