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

describe("ObjectTypeDefinition", () => {
  it("renders a simple object type with fields", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition
          name="name"
          type={code`${builtInScalars.String}!`}
        />
        <gql.FieldDefinition name="email" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>,
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
      <gql.ObjectTypeDefinition
        name="User"
        doc={`"""\nA user in the system\n"""`}
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>,
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
      <gql.ObjectTypeDefinition
        name="User"
        doc={`"""\nA user in the system.\nCan have multiple lines of documentation.\n"""`}
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>,
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
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition
          name="id"
          type={code`${builtInScalars.ID}!`}
          doc={`"""\nUnique identifier\n"""`}
        />
        <gql.FieldDefinition
          name="email"
          type={builtInScalars.String}
          doc={`"""\nUser's email address\n"""`}
        />
      </gql.ObjectTypeDefinition>,
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
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition
          name="tags"
          type={code`[${builtInScalars.String}!]!`}
        />
        <gql.FieldDefinition
          name="scores"
          type={code`[${builtInScalars.Float}]`}
        />
      </gql.ObjectTypeDefinition>,
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
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="name"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition name="posts" type={code`[${postRef}]!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="title"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition name="author" type={code`${userRef}!`} />
        </gql.ObjectTypeDefinition>
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
    const result = toGraphQLText(<gql.ObjectTypeDefinition name="EmptyType" />);
    expect(result).toRenderTo(d`
      type EmptyType {

      }
    `);
  });

  it("renders object types with custom type references", () => {
    const userRef = refkey();
    const postRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition name="user" type={userRef} />
          <gql.FieldDefinition name="post" type={postRef} />
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
        user: User
        post: Post
      }
    `);
  });

  it("renders a complete minimal schema", () => {
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="hello"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDefinition>
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
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="name"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post">
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="title"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDefinition>
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
        <gql.ObjectTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="name" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
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
        <gql.ObjectTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Timestamped" refkey={timestampedRef}>
          <gql.FieldDefinition name="createdAt" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="User"
          implements={[nodeRef, timestampedRef]}
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="createdAt" type={builtInScalars.String} />
          <gql.FieldDefinition name="name" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
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
      <gql.ObjectTypeDefinition
        name="User"
        directives={<gql.Directive name="auth" args={{ requires: "ADMIN" }} />}
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User @auth(requires: "ADMIN") {
        id: ID!
      }
    `);
  });

  it("renders an object type with multiple directives", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition
        name="User"
        directives={
          <>
            <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
            <gql.Directive name={builtInDirectives.deprecated} />
          </>
        }
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User @auth(requires: "ADMIN") @deprecated {
        id: ID!
      }
    `);
  });
});
