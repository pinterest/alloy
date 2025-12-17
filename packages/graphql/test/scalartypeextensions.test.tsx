import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("ScalarTypeExtension", () => {
  it("renders a scalar extension with a directive", () => {
    const result = toGraphQLText(
      <gql.ScalarTypeExtension
        name="DateTime"
        directives={
          <gql.Directive
            name="specifiedBy"
            args={{ url: "https://tools.ietf.org/html/rfc3339" }}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      extend scalar DateTime @specifiedBy(url: "https://tools.ietf.org/html/rfc3339")
    `);
  });

  it("renders a scalar extension with multiple directives", () => {
    const result = toGraphQLText(
      <gql.ScalarTypeExtension
        name="JSON"
        directives={
          <>
            <gql.Directive name="custom" args={{ value: "test" }} />
            <gql.Directive name="another" />
          </>
        }
      />,
    );
    expect(result).toRenderTo(d`
      extend scalar Json @custom(value: "test") @another
    `);
  });

  it("renders a scalar extension with refkey", () => {
    const dateTimeRef = refkey();

    const result = toGraphQLText(
      <gql.ScalarTypeExtension
        name="DateTime"
        refkey={dateTimeRef}
        directives={<gql.Directive name="deprecated" />}
      />,
    );
    expect(result).toRenderTo(d`
      extend scalar DateTime @deprecated
    `);
  });
});
