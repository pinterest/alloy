/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import {
  assertFileContents,
  toGraphQLText,
  toGraphQLTextMultiple,
} from "./utils.jsx";

describe("ObjectTypeDeclaration", () => {
  it("renders a simple object type with fields", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="User">
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDeclaration
          name="name"
          type={code`${builtInScalars.String}!`}
        />
        <gql.FieldDeclaration name="email" type={builtInScalars.String} />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID!
        name: String!
        email: String
      }
    `);
  });

  it("renders an object type with a description", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration
        name="User"
        doc={`"""\nA user in the system\n"""`}
      >
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      """
      A user in the system
      """
      type User {
        id: ID!
      }
    `);
  });

  it("renders an object type with multi-line description", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration
        name="User"
        doc={`"""\nA user in the system.\nCan have multiple lines of documentation.\n"""`}
      >
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      """
      A user in the system.
      Can have multiple lines of documentation.
      """
      type User {
        id: ID!
      }
    `);
  });

  it("renders an object type with field descriptions", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="User">
        <gql.FieldDeclaration
          name="id"
          type={code`${builtInScalars.ID}!`}
          doc={`"""\nUnique identifier\n"""`}
        />
        <gql.FieldDeclaration
          name="email"
          type={builtInScalars.String}
          doc={`"""\nUser's email address\n"""`}
        />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type User {
        """
        Unique identifier
        """
        id: ID!
        """
        User's email address
        """
        email: String
      }
    `);
  });

  it("renders an object type with list fields", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="User">
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDeclaration
          name="tags"
          type={code`[${builtInScalars.String}!]!`}
        />
        <gql.FieldDeclaration
          name="scores"
          type={code`[${builtInScalars.Float}]`}
        />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID!
        tags: [String!]!
        scores: [Float]
      }
    `);
  });

  it("supports cross-type references", () => {
    const userRef = refkey();
    const postRef = refkey();

    const res = toGraphQLTextMultiple([
      <gql.SourceFile path="schema.graphql">
        <gql.ObjectTypeDeclaration name="User" refkey={userRef}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration
            name="name"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDeclaration name="posts" type={code`[${postRef}]!`} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="Post" refkey={postRef}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration
            name="title"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDeclaration name="author" type={code`${userRef}!`} />
        </gql.ObjectTypeDeclaration>
      </gql.SourceFile>,
    ]);

    assertFileContents(res, {
      "schema.graphql": `
        type User {
          id: ID!
          name: String!
          posts: [Post]!
        }

        type Post {
          id: ID!
          title: String!
          author: User!
        }
      `,
    });
  });

  it("renders an empty object type", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="EmptyType" />,
    );
    expect(result).toRenderTo(d`
      type EmptyType {

      }
    `);
  });

  it("renders object types with custom type references", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration name="Query">
        <gql.FieldDeclaration name="user" type="User" />
        <gql.FieldDeclaration name="post" type="Post" />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type Query {
        user: User
        post: Post
      }
    `);
  });

  it("renders a complete minimal schema", () => {
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="Query">
          <gql.FieldDeclaration
            name="hello"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type Query {
        hello: String!
      }
    `);
  });

  it("renders multiple object types in a schema", () => {
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="User">
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration
            name="name"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="Post">
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration
            name="title"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID!
        name: String!
      }
      
      type Post {
        id: ID!
        title: String!
      }
    `);
  });

  it("renders an object type implementing an interface", () => {
    const nodeRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="Node" refkey={nodeRef}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="User" implements={[nodeRef]}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration name="name" type={builtInScalars.String} />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type Node {
        id: ID!
      }
      
      type User implements Node {
        id: ID!
        name: String
      }
    `);
  });

  it("renders an object type implementing multiple interfaces", () => {
    const nodeRef = refkey();
    const timestampedRef = refkey();
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDeclaration name="Node" refkey={nodeRef}>
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration name="Timestamped" refkey={timestampedRef}>
          <gql.FieldDeclaration name="createdAt" type={builtInScalars.String} />
        </gql.ObjectTypeDeclaration>
        <gql.ObjectTypeDeclaration
          name="User"
          implements={[nodeRef, timestampedRef]}
        >
          <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDeclaration name="createdAt" type={builtInScalars.String} />
          <gql.FieldDeclaration name="name" type={builtInScalars.String} />
        </gql.ObjectTypeDeclaration>
      </>,
    );
    expect(result).toRenderTo(d`
      type Node {
        id: ID!
      }
      
      type Timestamped {
        createdAt: String
      }
      
      type User implements Node Timestamped {
        id: ID!
        createdAt: String
        name: String
      }
    `);
  });

  it("renders an object type with a directive", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration
        name="User"
        directives={
          <gql.DirectiveApplication name="auth" args={{ requires: "ADMIN" }} />
        }
      >
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type User @auth(requires: "ADMIN") {
        id: ID!
      }
    `);
  });

  it("renders an object type with multiple directives", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDeclaration
        name="User"
        directives={
          <>
            <gql.DirectiveApplication
              name="auth"
              args={{ requires: "ADMIN" }}
            />
            <gql.DirectiveApplication name={builtInDirectives.deprecated} />
          </>
        }
      >
        <gql.FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDeclaration>,
    );
    expect(result).toRenderTo(d`
      type User @auth(requires: "ADMIN") @deprecated {
        id: ID!
      }
    `);
  });
});
