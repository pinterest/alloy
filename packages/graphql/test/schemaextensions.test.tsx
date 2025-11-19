import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("SchemaExtension", () => {
  it("renders a schema extension adding subscription", () => {
    const result = toGraphQLText(
      <gql.SchemaExtension subscription="Subscription" />,
    );
    expect(result).toRenderTo(d`
      extend schema {
        subscription: Subscription
      }
    `);
  });

  it("renders a schema extension with only directives", () => {
    const result = toGraphQLText(
      <gql.SchemaExtension
        directives={
          <gql.Directive
            name="link"
            args={{ url: "https://specs.apollo.dev/federation/v2.0" }}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      extend schema @link(url: "https://specs.apollo.dev/federation/v2.0")
    `);
  });

  it("renders a schema extension with operation types and directives", () => {
    const result = toGraphQLText(
      <gql.SchemaExtension
        mutation="Mutation"
        directives={<gql.Directive name="shareable" />}
      />,
    );
    expect(result).toRenderTo(d`
      extend schema @shareable {
        mutation: Mutation
      }
    `);
  });

  it("renders a schema extension with all operation types", () => {
    const result = toGraphQLText(
      <gql.SchemaExtension
        query="Query"
        mutation="Mutation"
        subscription="Subscription"
      />,
    );
    expect(result).toRenderTo(d`
      extend schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
      }
    `);
  });

  it("renders a schema extension with string type names", () => {
    const result = toGraphQLText(
      <gql.SchemaExtension query="RootQuery" mutation="RootMutation" />,
    );
    expect(result).toRenderTo(d`
      extend schema {
        query: RootQuery
        mutation: RootMutation
      }
    `);
  });

  it("renders multiple schema extensions", () => {
    const result = toGraphQLText(
      <>
        <gql.SchemaExtension subscription="Subscription" />
        <gql.SchemaExtension directives={<gql.Directive name="federation" />} />
      </>,
    );
    expect(result).toRenderTo(d`
      extend schema {
        subscription: Subscription
      }
      
      extend schema @federation
    `);
  });
});
