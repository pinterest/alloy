import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Complete Schema Integration", () => {
  it("renders a complete blog application schema with types, operations, and all GraphQL features", () => {
    // Define refkeys for type references
    const nodeRef = refkey();
    const timestampedRef = refkey();
    const userRef = refkey();
    const postRef = refkey();
    const commentRef = refkey();
    const postStatusRef = refkey();
    const publishedRef = refkey();
    const draftRef = refkey();

    const result = toGraphQLText(
      <gql.SourceFile path="blog.graphql">
        {/* Interface definitions */}
        <gql.InterfaceTypeDefinition
          name="Node"
          refkey={nodeRef}
          description="Object with a unique identifier"
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.InterfaceTypeDefinition>

        <gql.InterfaceTypeDefinition
          name="Timestamped"
          refkey={timestampedRef}
          description="Object with timestamp fields"
        >
          <gql.FieldDefinition
            name="createdAt"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition
            name="updatedAt"
            type={code`${builtInScalars.String}!`}
          />
        </gql.InterfaceTypeDefinition>

        {/* Enum definition */}
        <gql.EnumTypeDefinition
          name="PostStatus"
          refkey={postStatusRef}
          description="Status of a blog post"
        >
          <gql.EnumValue
            name="PUBLISHED"
            refkey={publishedRef}
            description="Post is published and visible"
          />
          <gql.EnumValue
            name="DRAFT"
            refkey={draftRef}
            description="Post is in draft mode"
          />
          <gql.EnumValue name="ARCHIVED" description="Post is archived" />
        </gql.EnumTypeDefinition>

        {/* Object type definitions */}
        <gql.ObjectTypeDefinition
          name="User"
          refkey={userRef}
          implements={[nodeRef, timestampedRef]}
          description="A user in the blog system"
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="username"
            type={code`${builtInScalars.String}!`}
            description="Unique username"
          />
          <gql.FieldDefinition
            name="email"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition name="postCount" type={builtInScalars.Int} />
          <gql.FieldDefinition
            name="createdAt"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition
            name="updatedAt"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDefinition>

        <gql.ObjectTypeDefinition
          name="Post"
          refkey={postRef}
          implements={[nodeRef, timestampedRef]}
          description="A blog post"
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="title"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition
            name="content"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition name="status" type={code`${postStatusRef}!`} />
          <gql.FieldDefinition name="author" type={code`${userRef}!`} />
          <gql.FieldDefinition name="commentCount" type={builtInScalars.Int} />
          <gql.FieldDefinition
            name="createdAt"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition
            name="updatedAt"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDefinition>

        <gql.ObjectTypeDefinition
          name="Comment"
          refkey={commentRef}
          implements={[nodeRef, timestampedRef]}
          description="A comment on a post"
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="content"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition name="author" type={code`${userRef}!`} />
          <gql.FieldDefinition name="post" type={code`${postRef}!`} />
          <gql.FieldDefinition
            name="createdAt"
            type={code`${builtInScalars.String}!`}
          />
          <gql.FieldDefinition
            name="updatedAt"
            type={code`${builtInScalars.String}!`}
          />
        </gql.ObjectTypeDefinition>

        {/* Query root type */}
        <gql.ObjectTypeDefinition name="Query" description="Root query type">
          <gql.FieldDefinition
            name="user"
            type={userRef}
            args={
              <gql.InputValueDefinition
                name="id"
                type={code`${builtInScalars.ID}!`}
              />
            }
          />
          <gql.FieldDefinition
            name="post"
            type={postRef}
            args={
              <gql.InputValueDefinition
                name="id"
                type={code`${builtInScalars.ID}!`}
              />
            }
          />
          <gql.FieldDefinition
            name="posts"
            type={code`[${postRef}!]!`}
            args={
              <>
                <gql.InputValueDefinition
                  name="status"
                  type={postStatusRef}
                  defaultValue={code`${publishedRef}`}
                />
                <gql.InputValueDefinition
                  name="limit"
                  type={builtInScalars.Int}
                  defaultValue={10}
                />
              </>
            }
          />
        </gql.ObjectTypeDefinition>

        {/* Mutation root type */}
        <gql.ObjectTypeDefinition
          name="Mutation"
          description="Root mutation type"
        >
          <gql.FieldDefinition
            name="createPost"
            type={code`${postRef}!`}
            args={
              <>
                <gql.InputValueDefinition
                  name="title"
                  type={code`${builtInScalars.String}!`}
                />
                <gql.InputValueDefinition
                  name="content"
                  type={code`${builtInScalars.String}!`}
                />
                <gql.InputValueDefinition
                  name="status"
                  type={postStatusRef}
                  defaultValue={code`${draftRef}`}
                />
              </>
            }
          />
          <gql.FieldDefinition
            name="updatePost"
            type={postRef}
            args={
              <>
                <gql.InputValueDefinition
                  name="id"
                  type={code`${builtInScalars.ID}!`}
                />
                <gql.InputValueDefinition
                  name="title"
                  type={builtInScalars.String}
                />
                <gql.InputValueDefinition name="status" type={postStatusRef} />
              </>
            }
          />
          <gql.FieldDefinition
            name="deletePost"
            type={builtInScalars.Boolean}
            args={
              <gql.InputValueDefinition
                name="id"
                type={code`${builtInScalars.ID}!`}
              />
            }
          />
        </gql.ObjectTypeDefinition>

        {/* Query operation with variables, inline fragments, and directives */}
        <gql.OperationDefinition
          operationType="query"
          name="GetUserWithPosts"
          description="Fetch a user with their posts and optional email"
          variableDefinitions={
            <>
              <gql.VariableDefinition
                name="userId"
                type={code`${builtInScalars.ID}!`}
              />
              <gql.VariableDefinition
                name="postStatus"
                type={postStatusRef}
                defaultValue={code`${publishedRef}`}
              />
              <gql.VariableDefinition
                name="includeEmail"
                type={builtInScalars.Boolean}
                defaultValue={false}
              />
            </>
          }
        >
          <gql.FieldSelection
            name="user"
            arguments={
              <gql.Argument name="id" value={<gql.Variable name="userId" />} />
            }
          >
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="username" />
            <gql.FieldSelection name="postCount" />
            <gql.InlineFragment
              directives={
                <gql.Directive
                  name="include"
                  args={{ if: <gql.Variable name="includeEmail" /> }}
                />
              }
            >
              <gql.FieldSelection name="email" />
            </gql.InlineFragment>
            <gql.FieldSelection name="posts" alias="userPosts">
              <gql.FieldSelection name="id" />
              <gql.FieldSelection name="title" />
              <gql.FieldSelection name="status" />
              <gql.FieldSelection name="commentCount" />
              <gql.FieldSelection name="author">
                <gql.FieldSelection name="username" />
              </gql.FieldSelection>
            </gql.FieldSelection>
          </gql.FieldSelection>
        </gql.OperationDefinition>

        {/* Mutation operation */}
        <gql.OperationDefinition
          operationType="mutation"
          name="CreateBlogPost"
          description="Create a new blog post with title and content"
          variableDefinitions={
            <>
              <gql.VariableDefinition
                name="title"
                type={code`${builtInScalars.String}!`}
              />
              <gql.VariableDefinition
                name="content"
                type={code`${builtInScalars.String}!`}
              />
              <gql.VariableDefinition
                name="status"
                type={postStatusRef}
                defaultValue={code`${draftRef}`}
              />
            </>
          }
        >
          <gql.FieldSelection
            name="createPost"
            arguments={
              <>
                <gql.Argument
                  name="title"
                  value={<gql.Variable name="title" />}
                />
                <gql.Argument
                  name="content"
                  value={<gql.Variable name="content" />}
                />
                <gql.Argument
                  name="status"
                  value={<gql.Variable name="status" />}
                />
              </>
            }
          >
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="title" />
            <gql.FieldSelection name="status" />
            <gql.FieldSelection name="createdAt" />
            <gql.FieldSelection name="author">
              <gql.FieldSelection name="username" />
            </gql.FieldSelection>
          </gql.FieldSelection>
        </gql.OperationDefinition>
      </gql.SourceFile>,
    );

    expect(result).toRenderTo(d`
      """
      Object with a unique identifier
      """
      interface Node {
        id: ID!
      }
      
      """
      Object with timestamp fields
      """
      interface Timestamped {
        createdAt: String!
        updatedAt: String!
      }
      
      """
      Status of a blog post
      """
      enum PostStatus {
        """
        Post is published and visible
        """
        PUBLISHED
        """
        Post is in draft mode
        """
        DRAFT
        """
        Post is archived
        """
        ARCHIVED
      }
      
      """
      A user in the blog system
      """
      type User implements Node & Timestamped {
        id: ID!
        """
        Unique username
        """
        username: String!
        email: String!
        postCount: Int
        createdAt: String!
        updatedAt: String!
      }
      
      """
      A blog post
      """
      type Post implements Node & Timestamped {
        id: ID!
        title: String!
        content: String!
        status: PostStatus!
        author: User!
        commentCount: Int
        createdAt: String!
        updatedAt: String!
      }
      
      """
      A comment on a post
      """
      type Comment implements Node & Timestamped {
        id: ID!
        content: String!
        author: User!
        post: Post!
        createdAt: String!
        updatedAt: String!
      }
      
      """
      Root query type
      """
      type Query {
        user(id: ID!): User
        post(id: ID!): Post
        posts(status: PostStatus = PUBLISHED, limit: Int = 10): [Post!]!
      }
      
      """
      Root mutation type
      """
      type Mutation {
        createPost(title: String!, content: String!, status: PostStatus = DRAFT): Post!
        updatePost(id: ID!, title: String, status: PostStatus): Post
        deletePost(id: ID!): Boolean
      }
      
      """
      Fetch a user with their posts and optional email
      """
      query GetUserWithPosts($userId: ID!, $postStatus: PostStatus = PUBLISHED, $includeEmail: Boolean = false) {
        user(id: $userId) {
          id
          username
          postCount
          ... @include(if: $includeEmail) {
            email
          }
          userPosts: posts {
            id
            title
            status
            commentCount
            author {
              username
            }
          }
        }
      }
      
      """
      Create a new blog post with title and content
      """
      mutation CreateBlogPost($title: String!, $content: String!, $status: PostStatus = DRAFT) {
        createPost(title: $title, content: $content, status: $status) {
          id
          title
          status
          createdAt
          author {
            username
          }
        }
      }
    `);
  });

  it("renders multiple operations in a single file", () => {
    const userRef = refkey();
    const postRef = refkey();

    const result = toGraphQLText(
      <gql.SourceFile path="operations.graphql">
        {/* Type definitions */}
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="name" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>

        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="title" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>

        {/* Query operation */}
        <gql.OperationDefinition
          operationType="query"
          name="GetUser"
          variableDefinitions={
            <gql.VariableDefinition
              name="id"
              type={code`${builtInScalars.ID}!`}
            />
          }
        >
          <gql.FieldSelection
            name="user"
            arguments={
              <gql.Argument name="id" value={<gql.Variable name="id" />} />
            }
          >
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="name" />
          </gql.FieldSelection>
        </gql.OperationDefinition>

        {/* Mutation operation */}
        <gql.OperationDefinition
          operationType="mutation"
          name="CreatePost"
          variableDefinitions={
            <gql.VariableDefinition
              name="title"
              type={code`${builtInScalars.String}!`}
            />
          }
        >
          <gql.FieldSelection
            name="createPost"
            arguments={
              <gql.Argument
                name="title"
                value={<gql.Variable name="title" />}
              />
            }
          >
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="title" />
          </gql.FieldSelection>
        </gql.OperationDefinition>

        {/* Subscription operation */}
        <gql.OperationDefinition
          operationType="subscription"
          name="OnPostCreated"
        >
          <gql.FieldSelection name="postCreated">
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="title" />
          </gql.FieldSelection>
        </gql.OperationDefinition>
      </gql.SourceFile>,
    );

    expect(result).toRenderTo(d`
      type User {
        id: ID!
        name: String
      }
      
      type Post {
        id: ID!
        title: String
      }
      
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
      
      mutation CreatePost($title: String!) {
        createPost(title: $title) {
          id
          title
        }
      }
      
      subscription OnPostCreated {
        postCreated {
          id
          title
        }
      }
    `);
  });

  it("renders fragments with nested spreads", () => {
    const userFieldsRef = refkey();
    const userDetailsRef = refkey();

    const result = toGraphQLText(
      <gql.SourceFile path="fragments.graphql">
        {/* Base fragment */}
        <gql.FragmentDefinition
          name="UserFields"
          refkey={userFieldsRef}
          typeCondition="User"
        >
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FragmentDefinition>

        {/* Fragment that spreads another fragment */}
        <gql.FragmentDefinition
          name="UserDetails"
          refkey={userDetailsRef}
          typeCondition="User"
        >
          <gql.FragmentSpread name={userFieldsRef} />
          <gql.FieldSelection name="email" />
          <gql.FieldSelection name="createdAt" />
        </gql.FragmentDefinition>

        {/* Query using nested fragments */}
        <gql.OperationDefinition
          operationType="query"
          name="GetUserWithDetails"
        >
          <gql.FieldSelection name="user">
            <gql.FragmentSpread name={userDetailsRef} />
            <gql.FieldSelection name="postCount" />
          </gql.FieldSelection>
        </gql.OperationDefinition>
      </gql.SourceFile>,
    );

    expect(result).toRenderTo(d`
      fragment UserFields on User {
        id
        name
      }
      
      fragment UserDetails on User {
        ...UserFields
        email
        createdAt
      }
      
      query GetUserWithDetails {
        user {
          ...UserDetails
          postCount
        }
      }
    `);
  });

  it("renders complex directive usage across different component types", () => {
    const authDirectiveRef = refkey();
    const adminRoleRef = refkey();

    const result = toGraphQLText(
      <gql.SourceFile path="directives.graphql">
        {/* Custom directive definition */}
        <gql.DirectiveDefinition
          name="auth"
          refkey={authDirectiveRef}
          locations={["FIELD_DEFINITION", "OBJECT"]}
          repeatable
          args={
            <gql.InputValueDefinition
              name="requires"
              type={builtInScalars.String}
            />
          }
        />

        <gql.EnumTypeDefinition name="Role" refkey={adminRoleRef}>
          <gql.EnumValue name="ADMIN" />
          <gql.EnumValue name="USER" />
        </gql.EnumTypeDefinition>

        {/* Object type with directives */}
        <gql.ObjectTypeDefinition
          name="User"
          directives={
            <gql.Directive
              name={authDirectiveRef}
              args={{ requires: "USER" }}
            />
          }
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="email"
            type={builtInScalars.String}
            directives={
              <gql.Directive
                name={authDirectiveRef}
                args={{ requires: "ADMIN" }}
              />
            }
          />
          <gql.FieldDefinition
            name="publicField"
            type={builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>

        {/* Query with field directives */}
        <gql.OperationDefinition
          operationType="query"
          name="GetUser"
          variableDefinitions={
            <>
              <gql.VariableDefinition
                name="includeEmail"
                type={builtInScalars.Boolean}
                defaultValue={false}
              />
            </>
          }
        >
          <gql.FieldSelection name="user">
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="publicField" />
            <gql.FieldSelection
              name="email"
              directives={
                <gql.Directive
                  name="include"
                  args={{ if: <gql.Variable name="includeEmail" /> }}
                />
              }
            />
          </gql.FieldSelection>
        </gql.OperationDefinition>
      </gql.SourceFile>,
    );

    // Directive definition may render single-line or multi-line depending on length
    expect(result).toContain("directive @auth");
    expect(result).toContain("requires: String");
    expect(result).toContain("repeatable on FIELD_DEFINITION | OBJECT");
    expect(result).toContain("enum Role");
    expect(result).toContain('type User @auth(requires: "USER")');
    expect(result).toContain('email: String @auth(requires: "ADMIN")');
    expect(result).toContain("query GetUser($includeEmail: Boolean = false)");
  });

  it("renders all extension types used together", () => {
    const result = toGraphQLText(
      <gql.SourceFile path="extensions.graphql">
        {/* Type extensions showcase */}
        <gql.ObjectTypeExtension name="User">
          <gql.FieldDefinition name="email" type={builtInScalars.String} />
          <gql.FieldDefinition name="phone" type={builtInScalars.String} />
        </gql.ObjectTypeExtension>

        <gql.EnumTypeExtension name="Role">
          <gql.EnumValue name="GUEST" />
          <gql.EnumValue name="MODERATOR" />
        </gql.EnumTypeExtension>

        <gql.UnionTypeExtension
          name="SearchResult"
          members={["Video", "Article"]}
        />

        <gql.InterfaceTypeExtension name="Node">
          <gql.FieldDefinition name="updatedAt" type="String" />
        </gql.InterfaceTypeExtension>

        <gql.ScalarTypeExtension
          name="DateTime"
          directives={
            <gql.Directive
              name="specifiedBy"
              args={{ url: "https://tools.ietf.org/html/rfc3339" }}
            />
          }
        />

        <gql.InputObjectTypeExtension name="FilterInput">
          <gql.InputFieldDeclaration name="limit" type={builtInScalars.Int} />
        </gql.InputObjectTypeExtension>
      </gql.SourceFile>,
    );

    // Verify all extension types are present
    expect(result).toContain("extend type User");
    expect(result).toContain("email: String");
    expect(result).toContain("extend enum Role");
    expect(result).toContain("GUEST");
    expect(result).toContain("extend union SearchResult = Video | Article");
    expect(result).toContain("extend interface Node");
    expect(result).toContain("updatedAt: String");
    expect(result).toContain("extend scalar DateTime");
    expect(result).toContain("@specifiedBy");
    expect(result).toContain("extend input FilterInput");
    expect(result).toContain("limit: Int");
  });

  it("renders complex schema with inline fragments and type conditions", () => {
    const searchResultRef = refkey();

    const result = toGraphQLText(
      <gql.SourceFile path="polymorphic.graphql">
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="name" type={builtInScalars.String} />
          <gql.FieldDefinition name="email" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>

        <gql.ObjectTypeDefinition name="Post">
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="title" type={builtInScalars.String} />
          <gql.FieldDefinition name="content" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>

        <gql.ObjectTypeDefinition name="Comment">
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="text" type={builtInScalars.String} />
          <gql.FieldDefinition name="author" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>

        <gql.UnionTypeDefinition
          name="SearchResult"
          refkey={searchResultRef}
          members={["User", "Post", "Comment"]}
        />

        <gql.OperationDefinition
          operationType="query"
          name="Search"
          variableDefinitions={
            <>
              <gql.VariableDefinition
                name="query"
                type={builtInScalars.String}
              />
              <gql.VariableDefinition
                name="includeDetails"
                type={builtInScalars.Boolean}
                defaultValue={false}
              />
            </>
          }
        >
          <gql.FieldSelection
            name="search"
            arguments={
              <gql.Argument
                name="query"
                value={<gql.Variable name="query" />}
              />
            }
          >
            <gql.InlineFragment typeCondition="User">
              <gql.FieldSelection name="id" />
              <gql.FieldSelection name="name" />
              <gql.InlineFragment
                directives={
                  <gql.Directive
                    name="include"
                    args={{ if: <gql.Variable name="includeDetails" /> }}
                  />
                }
              >
                <gql.FieldSelection name="email" />
              </gql.InlineFragment>
            </gql.InlineFragment>
            <gql.InlineFragment typeCondition="Post">
              <gql.FieldSelection name="id" />
              <gql.FieldSelection name="title" />
              <gql.InlineFragment
                directives={
                  <gql.Directive
                    name="include"
                    args={{ if: <gql.Variable name="includeDetails" /> }}
                  />
                }
              >
                <gql.FieldSelection name="content" />
              </gql.InlineFragment>
            </gql.InlineFragment>
            <gql.InlineFragment typeCondition="Comment">
              <gql.FieldSelection name="id" />
              <gql.FieldSelection name="text" />
              <gql.FieldSelection name="author" />
            </gql.InlineFragment>
          </gql.FieldSelection>
        </gql.OperationDefinition>
      </gql.SourceFile>,
    );

    expect(result).toRenderTo(d`
      type User {
        id: ID!
        name: String
        email: String
      }
      
      type Post {
        id: ID!
        title: String
        content: String
      }
      
      type Comment {
        id: ID!
        text: String
        author: String
      }
      
      union SearchResult = User | Post | Comment
      
      query Search($query: String, $includeDetails: Boolean = false) {
        search(query: $query) {
          ... on User {
            id
            name
            ... @include(if: $includeDetails) {
              email
            }
          }
          ... on Post {
            id
            title
            ... @include(if: $includeDetails) {
              content
            }
          }
          ... on Comment {
            id
            text
            author
          }
        }
      }
    `);
  });
});
