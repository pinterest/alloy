/** @jsxImportSource @alloy-js/core */
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("FieldSelection", () => {
  it("renders a simple field", () => {
    const result = toGraphQLText(<gql.FieldSelection name="id" />);
    expect(result).toBe("id");
  });

  it("renders a field with an alias", () => {
    const result = toGraphQLText(
      <gql.FieldSelection name="name" alias="userName" />,
    );
    expect(result).toBe("userName: name");
  });

  it("renders a field with arguments", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        arguments={
          <>
            <gql.Argument name="id" value="123" />
            <gql.Argument name="includeDeleted" value={false} />
          </>
        }
      />,
    );
    expect(result).toBe('user(id: "123", includeDeleted: false)');
  });

  it("renders a field with nested selection set", () => {
    const result = toGraphQLText(
      <gql.FieldSelection name="user">
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
        <gql.FieldSelection name="email" />
      </gql.FieldSelection>,
    );
    expect(result).toBe(`user {
  id
  name
  email
}`);
  });

  it("renders a field with alias, arguments, and nested fields", () => {
    const result = toGraphQLText(
      <gql.FieldSelection
        name="user"
        alias="currentUser"
        arguments={
          <gql.Argument name="id" value={<gql.Variable name="userId" />} />
        }
      >
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
      </gql.FieldSelection>,
    );
    expect(result).toBe(`currentUser: user(id: $userId) {
  id
  name
}`);
  });

  it("renders a field with directives", () => {
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

  it("renders nested fields with multiple levels", () => {
    const result = toGraphQLText(
      <gql.FieldSelection name="user">
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="posts">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="title" />
          <gql.FieldSelection name="author">
            <gql.FieldSelection name="name" />
          </gql.FieldSelection>
        </gql.FieldSelection>
      </gql.FieldSelection>,
    );
    expect(result).toBe(`user {
  id
  posts {
    id
    title
    author {
      name
    }
  }
}`);
  });
});
