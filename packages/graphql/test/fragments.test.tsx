import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("FragmentDefinition", () => {
  it("renders a simple fragment", () => {
    const result = toGraphQLText(
      <gql.FragmentDefinition name="UserFields" typeCondition="User">
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
        <gql.FieldSelection name="email" />
      </gql.FragmentDefinition>,
    );
    expect(result).toRenderTo(d`
      fragment UserFields on User {
        id
        name
        email
      }
    `);
  });

  it("renders a fragment with nested fields", () => {
    const result = toGraphQLText(
      <gql.FragmentDefinition name="UserWithPosts" typeCondition="User">
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
        <gql.FieldSelection name="posts">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="title" />
        </gql.FieldSelection>
      </gql.FragmentDefinition>,
    );
    expect(result).toRenderTo(d`
      fragment UserWithPosts on User {
        id
        name
        posts {
          id
          title
        }
      }
    `);
  });

  it("renders a fragment with directives", () => {
    const result = toGraphQLText(
      <gql.FragmentDefinition
        name="UserFields"
        typeCondition="User"
        directives={
          <gql.Directive name="cacheControl" args={{ maxAge: 3600 }} />
        }
      >
        <gql.FieldSelection name="id" />
        <gql.FieldSelection name="name" />
      </gql.FragmentDefinition>,
    );
    expect(result).toRenderTo(d`
      fragment UserFields on User @cacheControl(maxAge: 3600) {
        id
        name
      }
    `);
  });
});

describe("FragmentSpread", () => {
  it("renders a simple fragment spread", () => {
    const result = toGraphQLText(<gql.FragmentSpread name="UserFields" />);
    expect(result).toBe("...UserFields");
  });

  it("renders a fragment spread with refkey", () => {
    const fragmentRef = refkey();
    const result = toGraphQLText(<gql.FragmentSpread name={fragmentRef} />);
    // The refkey should render as a symbol reference
    expect(result).toContain("...");
  });

  it("renders a fragment spread with directives", () => {
    const result = toGraphQLText(
      <gql.FragmentSpread
        name="UserFields"
        directives={
          <gql.Directive
            name="include"
            args={{ if: <gql.Variable name="includeUser" /> }}
          />
        }
      />,
    );
    expect(result).toBe("...UserFields @include(if: $includeUser)");
  });
});

describe("InlineFragment", () => {
  it("renders an inline fragment with type condition", () => {
    const result = toGraphQLText(
      <gql.InlineFragment typeCondition="User">
        <gql.FieldSelection name="name" />
        <gql.FieldSelection name="email" />
      </gql.InlineFragment>,
    );
    expect(result).toRenderTo(d`
      ... on User {
        name
        email
      }
    `);
  });

  it("renders an inline fragment without type condition", () => {
    const result = toGraphQLText(
      <gql.InlineFragment
        directives={
          <gql.Directive
            name="include"
            args={{ if: <gql.Variable name="showDetails" /> }}
          />
        }
      >
        <gql.FieldSelection name="details" />
      </gql.InlineFragment>,
    );
    expect(result).toRenderTo(d`
      ... @include(if: $showDetails) {
        details
      }
    `);
  });

  it("renders an inline fragment with nested fields", () => {
    const result = toGraphQLText(
      <gql.InlineFragment typeCondition="Post">
        <gql.FieldSelection name="title" />
        <gql.FieldSelection name="content" />
        <gql.FieldSelection name="author">
          <gql.FieldSelection name="name" />
        </gql.FieldSelection>
      </gql.InlineFragment>,
    );
    expect(result).toRenderTo(d`
      ... on Post {
        title
        content
        author {
          name
        }
      }
    `);
  });
});
