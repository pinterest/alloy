/** @jsxImportSource @alloy-js/core */
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
          description='"""Object with a unique identifier"""'
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.InterfaceTypeDefinition>

        <gql.InterfaceTypeDefinition
          name="Timestamped"
          refkey={timestampedRef}
          description='"""Object with timestamp fields"""'
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
          description='"""Status of a blog post"""'
        >
          <gql.EnumValue
            name="PUBLISHED"
            refkey={publishedRef}
            description='"""Post is published and visible"""'
          />
          <gql.EnumValue
            name="DRAFT"
            refkey={draftRef}
            description='"""Post is in draft mode"""'
          />
          <gql.EnumValue name="ARCHIVED" description='"""Post is archived"""' />
        </gql.EnumTypeDefinition>

        {/* Object type definitions */}
        <gql.ObjectTypeDefinition
          name="User"
          refkey={userRef}
          implements={[nodeRef, timestampedRef]}
          description='"""A user in the blog system"""'
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="username"
            type={code`${builtInScalars.String}!`}
            description='"""Unique username"""'
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
          description='"""A blog post"""'
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
          description='"""A comment on a post"""'
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
        <gql.ObjectTypeDefinition
          name="Query"
          description='"""Root query type"""'
        >
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
          description='"""Root mutation type"""'
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
          description='"""Fetch a user with their posts and optional email"""'
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
          description='"""Create a new blog post with title and content"""'
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
      """Object with a unique identifier"""
      interface Node {
        id: ID!
      }
      
      """Object with timestamp fields"""
      interface Timestamped {
        createdAt: String!
        updatedAt: String!
      }
      
      """Status of a blog post"""
      enum PostStatus {
        """Post is published and visible"""
        PUBLISHED
        """Post is in draft mode"""
        DRAFT
        """Post is archived"""
        ARCHIVED
      }
      
      """A user in the blog system"""
      type User implements Node & Timestamped {
        id: ID!
        """Unique username"""
        username: String!
        email: String!
        postCount: Int
        createdAt: String!
        updatedAt: String!
      }
      
      """A blog post"""
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
      
      """A comment on a post"""
      type Comment implements Node & Timestamped {
        id: ID!
        content: String!
        author: User!
        post: Post!
        createdAt: String!
        updatedAt: String!
      }
      
      """Root query type"""
      type Query {
        user(id: ID!): User
        post(id: ID!): Post
        posts(status: PostStatus = PUBLISHED, limit: Int = 10): [Post!]!
      }
      
      """Root mutation type"""
      type Mutation {
        createPost(title: String!, content: String!, status: PostStatus = DRAFT): Post!
        updatePost(id: ID!, title: String, status: PostStatus): Post
        deletePost(id: ID!): Boolean
      }
      
      """Fetch a user with their posts and optional email"""
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
      
      """Create a new blog post with title and content"""
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
});
