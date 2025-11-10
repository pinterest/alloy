/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { assertFileContents, toGraphQLText, toGraphQLTextMultiple } from "./utils.jsx";

describe("UnionDeclaration", () => {
  it("renders a simple union with string type names", () => {
    const result = toGraphQLText(
      <gql.UnionDeclaration name="SearchResult" members={["User", "Post", "Comment"]} />,
    );
    expect(result).toRenderTo(d`
      union SearchResult = User | Post | Comment
    `);
  });

  it("renders a union with documentation", () => {
    const result = toGraphQLText(
      <gql.UnionDeclaration
        name="SearchResult"
        members={["User", "Post"]}
        description={`"""\nTypes that can be returned from search\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      Types that can be returned from search
      """
      union SearchResult = User | Post
    `);
  });

  it("renders a union with multi-line documentation", () => {
    const result = toGraphQLText(
      <gql.UnionDeclaration
        name="Node"
        members={["User", "Post"]}
        description={`"""\nTypes implementing the Node interface.\nUsed for pagination and caching.\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      Types implementing the Node interface.
      Used for pagination and caching.
      """
      union Node = User | Post
    `);
  });

  it("renders a union with refkey members", () => {
    const userRef = refkey();
    const postRef = refkey();
    const commentRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Comment" refkey={commentRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.UnionDeclaration
          name="SearchResult"
          members={[userRef, postRef, commentRef]}
        />
      </>,
    );

    expect(result).toRenderTo(d`
      type User {
        id: ID!
      }
      
      type Post {
        id: ID!
      }
      
      type Comment {
        id: ID!
      }
      
      union SearchResult = User | Post | Comment
    `);
  });

  it("renders a union with two members", () => {
    const result = toGraphQLText(
      <gql.UnionDeclaration name="Result" members={["Success", "Error"]} />,
    );
    expect(result).toRenderTo(d`
      union Result = Success | Error
    `);
  });

  it("renders a union with a directive", () => {
    const result = toGraphQLText(
      <gql.UnionDeclaration
        name="SearchResult"
        members={["User", "Post"]}
        directives={
          <gql.Directive name="auth" args={{ requires: "VIEWER" }} />
        }
      />,
    );
    expect(result).toRenderTo(d`
      union SearchResult @auth(requires: "VIEWER") = User | Post
    `);
  });

  it("supports cross-file union references", () => {
    const searchResultRef = refkey();

    const res = toGraphQLTextMultiple([
      <gql.SourceFile path="unions.graphql">
        <gql.UnionDeclaration
          name="SearchResult"
          members={["User", "Post", "Comment"]}
          refkey={searchResultRef}
        />
      </gql.SourceFile>,
      <gql.SourceFile path="types.graphql">
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="search"
            type={code`[${searchResultRef}!]!`}
            args={
              <gql.InputValueDefinition
                name="term"
                type={code`${builtInScalars.String}!`}
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </gql.SourceFile>,
    ]);

    assertFileContents(res, {
      "unions.graphql": `
        union SearchResult = User | Post | Comment
      `,
      "types.graphql": `
        type Query {
          search(term: String!): [SearchResult!]!
        }
      `,
    });
  });

  it("renders multiple unions", () => {
    const result = toGraphQLText(
      <>
        <gql.UnionDeclaration name="SearchResult" members={["User", "Post"]} />
        <gql.UnionDeclaration name="MediaItem" members={["Image", "Video", "Audio"]} />
        <gql.UnionDeclaration name="Notification" members={["Message", "Alert"]} />
      </>,
    );
    expect(result).toRenderTo(d`
      union SearchResult = User | Post
      
      union MediaItem = Image | Video | Audio
      
      union Notification = Message | Alert
    `);
  });

  it("renders a union with documentation and directive", () => {
    const result = toGraphQLText(
      <gql.UnionDeclaration
        name="SearchResult"
        members={["User", "Post"]}
        description={`"""\nSearch result types\n"""`}
        directives={
          <gql.Directive name="auth" args={{ requires: "VIEWER" }} />
        }
      />,
    );

    expect(result).toRenderTo(d`
      """
      Search result types
      """
      union SearchResult @auth(requires: "VIEWER") = User | Post
    `);
  });

  it("renders unions used in complex schemas", () => {
    const userRef = refkey();
    const postRef = refkey();
    const searchResultRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="name" type={code`${builtInScalars.String}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="title" type={code`${builtInScalars.String}!`} />
        </gql.ObjectTypeDefinition>
        <gql.UnionDeclaration
          name="SearchResult"
          members={[userRef, postRef]}
          refkey={searchResultRef}
        />
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="search"
            type={code`[${searchResultRef}!]!`}
            args={
              <gql.InputValueDefinition
                name="term"
                type={code`${builtInScalars.String}!`}
              />
            }
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
      
      union SearchResult = User | Post
      
      type Query {
        search(term: String!): [SearchResult!]!
      }
    `);
  });
});

