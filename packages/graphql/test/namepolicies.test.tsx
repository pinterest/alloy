/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

it("correct formatting of type name", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDeclaration name="a-really-WeirdType-name">
      <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
    </gql.ObjectTypeDeclaration>,
  );
  const expected = d`
    type AReallyWeirdTypeName {
      id: ID!
    }
  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of field names", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDeclaration name="User">
      <gql.FieldDeclaration name="user-ID" type={code`${builtInScalars.ID}!`} />
      <gql.FieldDeclaration name="FirstName" type={builtInScalars.String} />
      <gql.FieldDeclaration name="last_name" type={builtInScalars.String} />
    </gql.ObjectTypeDeclaration>,
  );
  const expected = d`
    type User {
      userId: ID!
      firstName: String
      lastName: String
    }
  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of argument names", () => {
  const result = toGraphQLText(
    <gql.FieldDeclaration
      name="user"
      type="User"
      args={
        <>
          <gql.ArgumentDeclaration
            name="user-ID"
            type={code`${builtInScalars.ID}!`}
          />
          <gql.ArgumentDeclaration
            name="FirstName"
            type={builtInScalars.String}
          />
          <gql.ArgumentDeclaration
            name="include_deleted"
            type={builtInScalars.Boolean}
          />
        </>
      }
    />,
  );
  expect(result).toBe(
    "user(userId: ID!, firstName: String, includeDeleted: Boolean): User",
  );
});

it("correct formatting of directive names", () => {
  const result = toGraphQLText(
    <gql.DirectiveDeclaration
      name="custom-Auth-Directive"
      locations={["FIELD_DEFINITION"]}
      args={<gql.ArgumentDeclaration name="required-Role" type="Role!" />}
    />,
  );
  expect(result).toBe(
    "directive @customAuthDirective(requiredRole: Role!) on FIELD_DEFINITION",
  );
});

it("appends _ to lowercase operation keywords (query, mutation, subscription)", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDeclaration name="query">
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="mutation">
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="subscription">
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>
    </>,
  );
  const expected = d`
    type Query_ {
      id: ID!
    }

    type Mutation_ {
      id: ID!
    }

    type Subscription_ {
      id: ID!
    }
  `;
  expect(result).toRenderTo(expected);
});

it("allows PascalCase operation type names (Query, Mutation, Subscription)", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDeclaration name="Query">
        <gql.FieldDeclaration name="hello" type={builtInScalars.String} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="Mutation">
        <gql.FieldDeclaration name="update" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="Subscription">
        <gql.FieldDeclaration name="onChange" type={builtInScalars.String} />
      </gql.ObjectTypeDeclaration>
    </>,
  );
  const expected = d`
    type Query {
      hello: String
    }

    type Mutation {
      update: Boolean
    }

    type Subscription {
      onChange: String
    }
  `;
  expect(result).toRenderTo(expected);
});

it("appends _ to reserved words in field names", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDeclaration name="User">
      <gql.FieldDeclaration name="type" type={builtInScalars.String} />
      <gql.FieldDeclaration name="on" type={builtInScalars.String} />
      <gql.FieldDeclaration name="null" type={builtInScalars.String} />
    </gql.ObjectTypeDeclaration>,
  );
  const expected = d`
    type User {
      type_: String
      on_: String
      null_: String
    }
  `;
  expect(result).toRenderTo(expected);
});

it("appends _ to reserved words in argument names", () => {
  const result = toGraphQLText(
    <gql.FieldDeclaration
      name="user"
      type="User"
      args={
        <>
          <gql.ArgumentDeclaration
            name="fragment"
            type={builtInScalars.String}
          />
          <gql.ArgumentDeclaration
            name="mutation"
            type={builtInScalars.Boolean}
          />
        </>
      }
    />,
  );
  expect(result).toBe("user(fragment_: String, mutation_: Boolean): User");
});

it("appends _ to all built-in scalar names (Int, Float, String, Boolean), except ID", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDeclaration name="Int">
        <gql.FieldDeclaration name="value" type={builtInScalars.Int} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="Float">
        <gql.FieldDeclaration name="value" type={builtInScalars.Float} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="String">
        <gql.FieldDeclaration name="value" type={builtInScalars.String} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="Boolean">
        <gql.FieldDeclaration name="value" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="ID">
        <gql.FieldDeclaration name="value" type={builtInScalars.ID} />
      </gql.ObjectTypeDeclaration>
    </>,
  );
  // ID won't get _ because it doesn't remain conflicting after transformation
  const expected = d`
    type Int_ {
      value: Int
    }

    type Float_ {
      value: Float
    }

    type String_ {
      value: String
    }

    type Boolean_ {
      value: Boolean
    }

    type Id {
      value: ID
    }
  `;
  expect(result).toRenderTo(expected);
});

it("does not append _ to built-in scalars when used as field types", () => {
  // Built-in scalars should only get _ when used as TYPE NAMES, not as field types
  const result = toGraphQLText(
    <gql.ObjectTypeDeclaration name="User">
      <gql.FieldDeclaration name="id" type={builtInScalars.ID} />
      <gql.FieldDeclaration name="name" type={builtInScalars.String} />
      <gql.FieldDeclaration name="age" type={builtInScalars.Int} />
      <gql.FieldDeclaration name="score" type={builtInScalars.Float} />
      <gql.FieldDeclaration name="active" type={builtInScalars.Boolean} />
    </gql.ObjectTypeDeclaration>,
  );
  const expected = d`
    type User {
      id: ID
      name: String
      age: Int
      score: Float
      active: Boolean
    }
  `;
  expect(result).toRenderTo(expected);
});

it("applies name policy to refkeys", () => {
  const userRef = refkey();
  const postRef = refkey();

  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDeclaration name="user-type" refkey={userRef}>
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDeclaration name="posts" type={code`[${postRef}!]!`} />
      </gql.ObjectTypeDeclaration>
      <gql.ObjectTypeDeclaration name="post-type" refkey={postRef}>
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDeclaration name="author" type={userRef} />
      </gql.ObjectTypeDeclaration>
    </>,
  );
  const expected = d`
    type UserType {
      id: ID!
      posts: [PostType!]!
    }

    type PostType {
      id: ID!
      author: UserType
    }
  `;
  expect(result).toRenderTo(expected);
});
