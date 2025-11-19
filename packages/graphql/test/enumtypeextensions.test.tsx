/** @jsxImportSource @alloy-js/core */
import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("EnumTypeExtension", () => {
  it("renders an enum extension with additional values", () => {
    const result = toGraphQLText(
      <gql.EnumTypeExtension name="Status">
        <gql.EnumValue name="ARCHIVED" />
        <gql.EnumValue name="SUSPENDED" />
      </gql.EnumTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend enum Status {
        ARCHIVED
        SUSPENDED
      }
    `);
  });

  it("renders an enum extension with value descriptions", () => {
    const result = toGraphQLText(
      <gql.EnumTypeExtension name="Role">
        <gql.EnumValue
          name="SUPER_ADMIN"
          description="Highest level of access"
        />
      </gql.EnumTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend enum Role {
        """
        Highest level of access
        """
        SUPER_ADMIN
      }
    `);
  });

  it("renders an enum extension with only directives", () => {
    const result = toGraphQLText(
      <gql.EnumTypeExtension
        name="Status"
        directives={<gql.Directive name={builtInDirectives.deprecated} />}
      />,
    );
    expect(result).toRenderTo(d`
      extend enum Status @deprecated
    `);
  });

  it("renders an enum extension with values and directives", () => {
    const result = toGraphQLText(
      <gql.EnumTypeExtension
        name="Priority"
        directives={<gql.Directive name="shareable" />}
      >
        <gql.EnumValue name="URGENT" />
        <gql.EnumValue name="CRITICAL" />
      </gql.EnumTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend enum Priority @shareable {
        URGENT
        CRITICAL
      }
    `);
  });

  it("renders an enum extension with value directives", () => {
    const result = toGraphQLText(
      <gql.EnumTypeExtension name="Status">
        <gql.EnumValue
          name="LEGACY"
          directives={
            <gql.Directive
              name={builtInDirectives.deprecated}
              args={{ reason: "Use NEW instead" }}
            />
          }
        />
      </gql.EnumTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend enum Status {
        LEGACY @deprecated(reason: "Use NEW instead")
      }
    `);
  });

  it("renders an enum extension with refkey", () => {
    const statusRef = refkey();

    const result = toGraphQLText(
      <gql.EnumTypeExtension name="Status" refkey={statusRef}>
        <gql.EnumValue name="FROZEN" />
      </gql.EnumTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend enum Status {
        FROZEN
      }
    `);
  });
});
