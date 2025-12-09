import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("InputValueDefinition", () => {
  it("renders a simple argument with scalar type", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="id"
        type={<gql.TypeReference type={builtInScalars.ID} />}
      />,
    );
    expect(result).toBe("id: ID");
  });

  it("renders a non-null argument", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="email"
        type={<gql.TypeReference type={builtInScalars.String} required />}
      />,
    );
    expect(result).toBe("email: String!");
  });

  it("renders an argument with string type", () => {
    const statusRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.InputValueDefinition
          name="status"
          type={<gql.TypeReference type={statusRef} required />}
        />
      </>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
      }
      
      status: Status!
    `);
  });

  it("renders an argument with default value (number)", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="limit"
        type={<gql.TypeReference type={builtInScalars.Int} />}
        defaultValue={10}
      />,
    );
    expect(result).toBe("limit: Int = 10");
  });

  it("renders an argument with default value (boolean)", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="includeDeleted"
        type={<gql.TypeReference type={builtInScalars.Boolean} />}
        defaultValue={false}
      />,
    );
    expect(result).toBe("includeDeleted: Boolean = false");
  });

  it("renders an argument with default value (string)", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="orderBy"
        type={<gql.TypeReference type={builtInScalars.String} />}
        defaultValue="createdAt"
      />,
    );
    expect(result).toBe('orderBy: String = "createdAt"');
  });

  it("renders an argument with default value (null)", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="filter"
        type={<gql.TypeReference type={builtInScalars.String} />}
        defaultValue={null}
      />,
    );
    expect(result).toBe("filter: String = null");
  });

  it("renders an argument with documentation", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="reason"
        type={<gql.TypeReference type={builtInScalars.String} />}
        description="Reason for deprecation"
      />,
    );
    expect(result).toRenderTo(d`
      """
      Reason for deprecation
      """
      reason: String
    `);
  });

  it("renders an argument with a directive", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="legacyArg"
        type={<gql.TypeReference type={builtInScalars.String} />}
        directives={<gql.Directive name={builtInDirectives.deprecated} />}
      />,
    );
    expect(result).toBe("legacyArg: String @deprecated");
  });

  it("renders an argument with a refkey to user-defined type", () => {
    const inputTypeRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.InputObjectTypeDefinition name="UserInput" refkey={inputTypeRef}>
          <gql.InputFieldDeclaration
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
        </gql.InputObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="createUser"
            type={<gql.TypeReference type={builtInScalars.Boolean} />}
            args={
              <gql.InputValueDefinition
                name="userInput"
                type={<gql.TypeReference type={inputTypeRef} required />}
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      input UserInput {
        name: String!
      }

      type Query {
        createUser(userInput: UserInput!): Boolean
      }
    `);
  });

  it("renders a list argument", () => {
    const result = toGraphQLText(
      <gql.InputValueDefinition
        name="ids"
        type={
          <gql.TypeReference
            type={<gql.TypeReference type={builtInScalars.ID} required />}
            list
            required
          />
        }
      />,
    );
    expect(result).toBe("ids: [ID!]!");
  });

  it("renders multiple arguments in a field", () => {
    const userRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="users"
            type={<gql.TypeReference type={userRef} list />}
            args={
              <>
                <gql.InputValueDefinition
                  name="limit"
                  type={<gql.TypeReference type={builtInScalars.Int} />}
                  defaultValue={10}
                />
                <gql.InputValueDefinition
                  name="offset"
                  type={<gql.TypeReference type={builtInScalars.Int} />}
                  defaultValue={0}
                />
                <gql.InputValueDefinition
                  name="includeDeleted"
                  type={<gql.TypeReference type={builtInScalars.Boolean} />}
                  defaultValue={false}
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
        users(limit: Int = 10, offset: Int = 0, includeDeleted: Boolean = false): [User]
      }
    `);
  });

  it("allows same argument names in different fields (checks correct scoping)", () => {
    const userRef = refkey();
    const postRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="users"
            type={<gql.TypeReference type={userRef} list />}
            args={
              <>
                <gql.InputValueDefinition
                  name="limit"
                  type={<gql.TypeReference type={builtInScalars.Int} />}
                  defaultValue={10}
                />
                <gql.InputValueDefinition
                  name="filter"
                  type={<gql.TypeReference type={builtInScalars.String} />}
                />
              </>
            }
          />
          <gql.FieldDefinition
            name="posts"
            type={<gql.TypeReference type={postRef} list />}
            args={
              <>
                <gql.InputValueDefinition
                  name="limit"
                  type={<gql.TypeReference type={builtInScalars.Int} />}
                  defaultValue={20}
                />
                <gql.InputValueDefinition
                  name="filter"
                  type={<gql.TypeReference type={builtInScalars.String} />}
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
      
      type Post {
        id: ID
      }
      
      type Query {
        users(limit: Int = 10, filter: String): [User]
        posts(limit: Int = 20, filter: String): [Post]
      }
    `);
  });
});
