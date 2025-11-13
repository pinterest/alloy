/** @jsxImportSource @alloy-js/core */
import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("UnionTypeExtension", () => {
  it("renders a union extension with additional members", () => {
    const result = toGraphQLText(
      <gql.UnionTypeExtension
        name="SearchResult"
        members={["Comment", "Article"]}
      />,
    );
    expect(result).toRenderTo(d`
      extend union SearchResult = Comment | Article
    `);
  });

  it("renders a union extension with a single member", () => {
    const result = toGraphQLText(
      <gql.UnionTypeExtension name="Node" members={["Comment"]} />,
    );
    expect(result).toRenderTo(d`
      extend union Node = Comment
    `);
  });

  it("renders a union extension with only directives", () => {
    const result = toGraphQLText(
      <gql.UnionTypeExtension
        name="Result"
        directives={<gql.Directive name="deprecated" />}
      />,
    );
    expect(result).toRenderTo(d`
      extend union Result @deprecated
    `);
  });

  it("renders a union extension with members and directives", () => {
    const result = toGraphQLText(
      <gql.UnionTypeExtension
        name="Media"
        members={["Audio", "Video"]}
        directives={<gql.Directive name="shareable" />}
      />,
    );
    expect(result).toRenderTo(d`
      extend union Media @shareable = Audio | Video
    `);
  });

  it("renders a union extension with refkey", () => {
    const mediaRef = refkey();

    const result = toGraphQLText(
      <gql.UnionTypeExtension
        name="Media"
        refkey={mediaRef}
        members={["Podcast"]}
      />,
    );
    expect(result).toRenderTo(d`
      extend union Media = Podcast
    `);
  });
});
