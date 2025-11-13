import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("FieldDefinition", () => {
  it("renders a simple field with scalar type", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition name="id" type={builtInScalars.ID} />,
    );
    expect(result).toBe("id: ID");
  });

  it("renders a non-null field", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="name"
        type={code`${builtInScalars.String}!`}
      />,
    );
    expect(result).toBe("name: String!");
  });

  it("renders a list field", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="tags"
        type={code`[${builtInScalars.String}]`}
      />,
    );
    expect(result).toBe("tags: [String]");
  });

  it("renders a list field with non-null items", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="tags"
        type={code`[${builtInScalars.String}!]`}
      />,
    );
    expect(result).toBe("tags: [String!]");
  });

  it("renders a non-null list field with non-null items", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="tags"
        type={code`[${builtInScalars.String}!]!`}
      />,
    );
    expect(result).toBe("tags: [String!]!");
  });

  it("renders a non-null list field with nullable items", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="tags"
        type={code`[${builtInScalars.String}]!`}
      />,
    );
    expect(result).toBe("tags: [String]!");
  });

  it("renders different scalar types", () => {
    const intField = toGraphQLText(
      <gql.FieldDefinition name="count" type={builtInScalars.Int} />,
    );
    expect(intField).toBe("count: Int");

    const floatField = toGraphQLText(
      <gql.FieldDefinition name="score" type={builtInScalars.Float} />,
    );
    expect(floatField).toBe("score: Float");

    const boolField = toGraphQLText(
      <gql.FieldDefinition name="active" type={builtInScalars.Boolean} />,
    );
    expect(boolField).toBe("active: Boolean");
  });

  it("renders a field with description", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="email"
        type={builtInScalars.String}
        description="The user's email address"
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
      <gql.FieldDefinition
        name="bio"
        type={builtInScalars.String}
        description="The user's biography.\nCan be multiple lines."
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
        <gql.ObjectTypeDefinition name="CustomType" refkey={customTypeRef}>
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition name="custom" type={customTypeRef} />
        </gql.ObjectTypeDefinition>
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

  it("renders field with custom type and non-null", () => {
    const statusRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition name="status" type={code`${statusRef}!`} />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
      }
      
      type Query {
        status: Status!
      }
    `);
  });

  it("renders a field with a refkey to user-defined type", () => {
    const userRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post">
          <gql.FieldDefinition name="author" type={userRef} />
        </gql.ObjectTypeDefinition>
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
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post">
          <gql.FieldDefinition name="author" type={code`${userRef}!`} />
          <gql.FieldDefinition
            name="contributors"
            type={code`[${userRef}!]!`}
          />
        </gql.ObjectTypeDefinition>
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
      <gql.FieldDefinition
        name="oldField"
        type={builtInScalars.String}
        directives={
          <gql.Directive
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
      <gql.FieldDefinition
        name="adminField"
        type={builtInScalars.String}
        directives={
          <>
            <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
            <gql.Directive name={builtInDirectives.deprecated} />
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
      <gql.FieldDefinition
        name="user"
        type={builtInScalars.String}
        args={
          <gql.InputValueDefinition
            name="id"
            type={code`${builtInScalars.ID}!`}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      user(id: ID!): String
    `);
  });

  it("renders a field with multiple arguments", () => {
    const result = toGraphQLText(
      <gql.FieldDefinition
        name="posts"
        type={code`[Post!]!`}
        args={
          <>
            <gql.InputValueDefinition name="limit" type={builtInScalars.Int} />
            <gql.InputValueDefinition name="offset" type={builtInScalars.Int} />
            <gql.InputValueDefinition
              name="authorId"
              type={builtInScalars.ID}
            />
          </>
        }
      />,
    );
    expect(result).toBe(
      "posts(limit: Int, offset: Int, authorId: ID): [Post!]!",
    );
  });
});
