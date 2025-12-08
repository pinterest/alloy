import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
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
        <gql.FieldDefinition
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} required />}
        />
        <gql.FieldDefinition
          name="name"
          type={<gql.TypeReference type={builtInScalars.String} required />}
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
      <gql.ObjectTypeDefinition name="User" description="A user in the system">
        <gql.FieldDefinition
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} required />}
        />
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
        description="A user in the system.\nCan have multiple lines of documentation."
      >
        <gql.FieldDefinition
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} required />}
        />
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
          type={<gql.TypeReference type={builtInScalars.ID} required />}
          description="Unique identifier"
        />
        <gql.FieldDefinition
          name="email"
          type={builtInScalars.String}
          description="User's email address"
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
        <gql.FieldDefinition
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} required />}
        />
        <gql.FieldDefinition
          name="tags"
          type={
            <gql.TypeReference
              type={<gql.TypeReference type={builtInScalars.String} required />}
              list
              required
            />
          }
        />
        <gql.FieldDefinition
          name="scores"
          type={<gql.TypeReference type={builtInScalars.Float} list />}
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
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
          <gql.FieldDefinition
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.FieldDefinition
            name="posts"
            type={<gql.TypeReference type={postRef} list required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
          <gql.FieldDefinition
            name="title"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
          <gql.FieldDefinition
            name="author"
            type={<gql.TypeReference type={userRef} required />}
          />
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
            type={<gql.TypeReference type={builtInScalars.String} required />}
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
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
          <gql.FieldDefinition
            name="name"
            type={<gql.TypeReference type={builtInScalars.String} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post">
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
          <gql.FieldDefinition
            name="title"
            type={<gql.TypeReference type={builtInScalars.String} required />}
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
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
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
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Timestamped" refkey={timestampedRef}>
          <gql.FieldDefinition name="createdAt" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="User"
          implements={[nodeRef, timestampedRef]}
        >
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
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
      
      type User implements Node & Timestamped {
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
        <gql.FieldDefinition
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} required />}
        />
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
            <gql.Directive name="cacheControl" args={{ maxAge: 3600 }} />
          </>
        }
      >
        <gql.FieldDefinition
          name="id"
          type={<gql.TypeReference type={builtInScalars.ID} required />}
        />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User @auth(requires: "ADMIN") @cacheControl(maxAge: 3600) {
        id: ID!
      }
    `);
  });

  it("renders an object type with union field types", () => {
    const searchResultRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.UnionTypeDefinition
          name="SearchResult"
          members={["User", "Post", "Comment"]}
          refkey={searchResultRef}
        />
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="search"
            type={
              <gql.TypeReference
                type={<gql.TypeReference type={searchResultRef} required />}
                list
                required
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      union SearchResult = User | Post | Comment
      
      type Query {
        search: [SearchResult!]!
      }
    `);
  });

  it("renders an object type with custom scalar field types", () => {
    const dateTimeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ScalarTypeDefinition name="DateTime" refkey={dateTimeRef} />
        <gql.ObjectTypeDefinition name="Event">
          <gql.FieldDefinition
            name="startTime"
            type={<gql.TypeReference type={dateTimeRef} required />}
          />
          <gql.FieldDefinition name="endTime" type={dateTimeRef} />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      scalar DateTime
      
      type Event {
        startTime: DateTime!
        endTime: DateTime
      }
    `);
  });
});
