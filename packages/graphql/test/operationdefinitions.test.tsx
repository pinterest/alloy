import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("OperationDefinition", () => {
  it("renders a simple anonymous query (shorthand syntax)", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition operationType="query">
        <gql.FieldSelection name="me">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      {
        me {
          id
          name
        }
      }
    `);
  });

  it("renders a named query", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition operationType="query" name="GetUser">
        <gql.FieldSelection name="user">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query GetUser {
        user {
          id
          name
        }
      }
    `);
  });

  it("renders a mutation", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition operationType="mutation" name="CreateUser">
        <gql.FieldSelection name="createUser">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      mutation CreateUser {
        createUser {
          id
          name
        }
      }
    `);
  });

  it("renders a subscription", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="subscription"
        name="OnUserCreated"
      >
        <gql.FieldSelection name="userCreated">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      subscription OnUserCreated {
        userCreated {
          id
          name
        }
      }
    `);
  });

  it("renders an operation with variable definitions", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="GetUser"
        variableDefinitions={
          <>
            <gql.VariableDefinition name="id" type="ID!" />
            <gql.VariableDefinition
              name="includeDeleted"
              type="Boolean"
              defaultValue={false}
            />
          </>
        }
      >
        <gql.FieldSelection name="user">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query GetUser($id: ID!, $includeDeleted: Boolean = false) {
        user {
          id
          name
        }
      }
    `);
  });

  it("renders an operation with directives", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="GetUser"
        directives={
          <gql.Directive name="cacheControl" args={{ maxAge: 3600 }} />
        }
      >
        <gql.FieldSelection name="user">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query GetUser @cacheControl(maxAge: 3600) {
        user {
          id
          name
        }
      }
    `);
  });

  it("renders an operation with variables, directives, and nested fields", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="GetUserPosts"
        variableDefinitions={
          <>
            <gql.VariableDefinition name="userId" type="ID!" />
            <gql.VariableDefinition name="limit" type="Int" defaultValue={10} />
          </>
        }
        directives={<gql.Directive name="cacheControl" args={{ maxAge: 60 }} />}
      >
        <gql.FieldSelection name="user">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
          <gql.FieldSelection name="posts">
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="title" />
          </gql.FieldSelection>
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      query GetUserPosts($userId: ID!, $limit: Int = 10) @cacheControl(maxAge: 60) {
        user {
          id
          name
          posts {
            id
            title
          }
        }
      }
    `);
  });

  it("renders an operation with description (September 2025 spec feature)", () => {
    const result = toGraphQLText(
      <gql.OperationDefinition
        operationType="query"
        name="GetUser"
        description="Fetch a user by their ID"
        variableDefinitions={<gql.VariableDefinition name="id" type="ID!" />}
      >
        <gql.FieldSelection name="user">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
          <gql.FieldSelection name="email" />
        </gql.FieldSelection>
      </gql.OperationDefinition>,
    );
    expect(result).toRenderTo(d`
      """
      Fetch a user by their ID
      """
      query GetUser($id: ID!) {
        user {
          id
          name
          email
        }
      }
    `);
  });
});
