/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

it("correct formatting of type name", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDefinition name="a-really-WeirdType-name">
      <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
    </gql.ObjectTypeDefinition>,
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
    <gql.ObjectTypeDefinition name="User">
      <gql.FieldDefinition name="user-ID" type={code`${builtInScalars.ID}!`} />
      <gql.FieldDefinition name="FirstName" type={builtInScalars.String} />
      <gql.FieldDefinition name="last_name" type={builtInScalars.String} />
    </gql.ObjectTypeDefinition>,
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
  const userRef = refkey();

  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="User" refkey={userRef}>
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Query">
        <gql.FieldDefinition
          name="user"
          type={userRef}
          args={
            <>
              <gql.InputValueDefinition
                name="user-ID"
                type={code`${builtInScalars.ID}!`}
              />
              <gql.InputValueDefinition
                name="FirstName"
                type={builtInScalars.String}
              />
              <gql.InputValueDefinition
                name="include_deleted"
                type={builtInScalars.Boolean}
              />
            </>
          }
        />
      </gql.ObjectTypeDefinition>
    </>,
  );
  expect(result).toRenderTo(d`
    type User {
      id: ID
    }
    
    type Query {
      user(userId: ID!, firstName: String, includeDeleted: Boolean): User
    }
  `);
});

it("correct formatting of directive names", () => {
  const result = toGraphQLText(
    <gql.DirectiveDefinition
      name="custom-Auth-Directive"
      locations={["FIELD_DEFINITION"]}
      args={<gql.InputValueDefinition name="required-Role" type="Role!" />}
    />,
  );
  expect(result).toBe(
    "directive @customAuthDirective(requiredRole: Role!) on FIELD_DEFINITION",
  );
});

it("appends _ to lowercase operation keywords (query, mutation, subscription)", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="query">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="mutation">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="subscription">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>
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
      <gql.ObjectTypeDefinition name="Query">
        <gql.FieldDefinition name="hello" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Mutation">
        <gql.FieldDefinition name="update" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Subscription">
        <gql.FieldDefinition name="onChange" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>
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
    <gql.ObjectTypeDefinition name="User">
      <gql.FieldDefinition name="type" type={builtInScalars.String} />
      <gql.FieldDefinition name="on" type={builtInScalars.String} />
      <gql.FieldDefinition name="null" type={builtInScalars.String} />
    </gql.ObjectTypeDefinition>,
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
  const userRef = refkey();

  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="User" refkey={userRef}>
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Query">
        <gql.FieldDefinition
          name="user"
          type={userRef}
          args={
            <>
              <gql.InputValueDefinition
                name="fragment"
                type={builtInScalars.String}
              />
              <gql.InputValueDefinition
                name="mutation"
                type={builtInScalars.Boolean}
              />
            </>
          }
        />
      </gql.ObjectTypeDefinition>
    </>,
  );
  expect(result).toRenderTo(d`
    type User {
      id: ID
    }
    
    type Query {
      user(fragment_: String, mutation_: Boolean): User
    }
  `);
});

it("appends _ to all built-in scalar names (Int, Float, String, Boolean), except ID", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="Int">
        <gql.FieldDefinition name="value" type={builtInScalars.Int} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Float">
        <gql.FieldDefinition name="value" type={builtInScalars.Float} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="String">
        <gql.FieldDefinition name="value" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Boolean">
        <gql.FieldDefinition name="value" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="ID">
        <gql.FieldDefinition name="value" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>
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
    <gql.ObjectTypeDefinition name="User">
      <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      <gql.FieldDefinition name="name" type={builtInScalars.String} />
      <gql.FieldDefinition name="age" type={builtInScalars.Int} />
      <gql.FieldDefinition name="score" type={builtInScalars.Float} />
      <gql.FieldDefinition name="active" type={builtInScalars.Boolean} />
    </gql.ObjectTypeDefinition>,
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
      <gql.ObjectTypeDefinition name="user-type" refkey={userRef}>
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition name="posts" type={code`[${postRef}!]!`} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="post-type" refkey={postRef}>
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition name="author" type={userRef} />
      </gql.ObjectTypeDefinition>
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
