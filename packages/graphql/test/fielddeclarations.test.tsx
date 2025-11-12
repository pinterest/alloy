/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("FieldDeclaration", () => {
  it("renders a simple field with scalar type", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration name="id" type={builtInScalars.ID} />,
    );
    expect(result).toBe("id: ID");
  });

  it("renders a non-null field", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="name"
        type={code`${builtInScalars.String}!`}
      />,
    );
    expect(result).toBe("name: String!");
  });

  it("renders a list field", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="tags"
        type={code`[${builtInScalars.String}]`}
      />,
    );
    expect(result).toBe("tags: [String]");
  });

  it("renders a list field with non-null items", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="tags"
        type={code`[${builtInScalars.String}!]`}
      />,
    );
    expect(result).toBe("tags: [String!]");
  });

  it("renders a non-null list field with non-null items", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="tags"
        type={code`[${builtInScalars.String}!]!`}
      />,
    );
    expect(result).toBe("tags: [String!]!");
  });

  it("renders a non-null list field with nullable items", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="tags"
        type={code`[${builtInScalars.String}]!`}
      />,
    );
    expect(result).toBe("tags: [String]!");
  });

  it("renders different scalar types", () => {
    const intField = toGraphQLText(
      <gql.FieldDeclaration name="count" type={builtInScalars.Int} />,
    );
    expect(intField).toBe("count: Int");

    const floatField = toGraphQLText(
      <gql.FieldDeclaration name="score" type={builtInScalars.Float} />,
    );
    expect(floatField).toBe("score: Float");

    const boolField = toGraphQLText(
      <gql.FieldDeclaration name="active" type={builtInScalars.Boolean} />,
    );
    expect(boolField).toBe("active: Boolean");
  });

  it("renders a field with description", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="email"
        type={builtInScalars.String}
        doc={`"""\nThe user's email address\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      The user's email address
      """
      email: String
    `);
  });

  it("renders a field with multi-line description", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="bio"
        type={builtInScalars.String}
        doc={`"""\nThe user's biography.\nCan be multiple lines.\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      The user's biography.
      Can be multiple lines.
      """
      bio: String
    `);
  });

  it("can reference custom type using refkey", () => {
    const customTypeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="CustomType" refkey={customTypeRef}>
          <gql.FieldDeclaration name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="Query">
          <gql.FieldDeclaration name="custom" type={customTypeRef} />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type CustomType {
        id: ID
      }
      
      type Query {
        custom: CustomType
      }
    `);
  });

  it("renders field with string type and non-null", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration name="status" type="Status!" />,
    );
    expect(result).toBe("status: Status!");
  });

  it("renders a field with a refkey to user-defined type", () => {
    const userRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="User" refkey={userRef}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="Post">
          <gql.FieldDeclaration name="author" type={userRef} />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID!
      }

      type Post {
        author: User
      }
    `);
  });

  it("renders a field with code template combining refkey and modifiers", () => {
    const userRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="User" refkey={userRef}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="Post">
          <gql.FieldDeclaration name="author" type={code`${userRef}!`} />
          <gql.FieldDeclaration
            name="contributors"
            type={code`[${userRef}!]!`}
          />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID!
      }

      type Post {
        author: User!
        contributors: [User!]!
      }
    `);
  });

  it("renders a field with a directive", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="oldField"
        type={builtInScalars.String}
        directives={
          <gql.DirectiveApplication
            name={builtInDirectives.deprecated}
            args={{ reason: "Use newField" }}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      oldField: String @deprecated(reason: "Use newField")
    `);
  });

  it("renders a field with multiple directives", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="adminField"
        type={builtInScalars.String}
        directives={
          <>
            <gql.DirectiveApplication
              name="auth"
              args={{ requires: "ADMIN" }}
            />
            <gql.DirectiveApplication name={builtInDirectives.deprecated} />
          </>
        }
      />,
    );
    expect(result).toBe(
      'adminField: String @auth(requires: "ADMIN") @deprecated',
    );
  });

  it("renders a field with arguments", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="user"
        type={builtInScalars.String}
        args={
          <gql.ArgumentDeclaration
            name="id"
            type={code`${builtInScalars.ID}!`}
          />
        }
      />,
    );
    expect(result).toBe("user(id: ID!): String");
  });

  it("renders a field with multiple arguments", () => {
    const result = toGraphQLText(
      <gql.FieldDeclaration
        name="posts"
        type={code`[Post!]!`}
        args={
          <>
            <gql.ArgumentDeclaration name="limit" type={builtInScalars.Int} />
            <gql.ArgumentDeclaration name="offset" type={builtInScalars.Int} />
            <gql.ArgumentDeclaration name="authorId" type={builtInScalars.ID} />
          </>
        }
      />,
    );
    expect(result).toBe(
      "posts(limit: Int, offset: Int, authorId: ID): [Post!]!",
    );
  });
});
