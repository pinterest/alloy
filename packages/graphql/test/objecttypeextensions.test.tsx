/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("ObjectTypeExtension", () => {
  it("renders an object extension with additional fields", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeExtension name="User">
        <gql.FieldDefinition
          name="createdAt"
          type={code`${builtInScalars.String}!`}
        />
        <gql.FieldDefinition name="updatedAt" type={builtInScalars.String} />
      </gql.ObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend type User {
        createdAt: String!
        updatedAt: String
      }
    `);
  });

  it("renders an object extension with implements", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeExtension
        name="User"
        implements={["Node", "Timestamped"]}
      />,
    );
    expect(result).toRenderTo(d`
      extend type User implements Node & Timestamped
    `);
  });

  it("renders an object extension with directives", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeExtension
        name="User"
        directives={<gql.Directive name="key" args={{ fields: "id" }} />}
      />,
    );
    expect(result).toRenderTo(d`
      extend type User @key(fields: "id")
    `);
  });

  it("renders an object extension with fields, implements, and directives", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeExtension
        name="User"
        implements={["Node"]}
        directives={<gql.Directive name="key" args={{ fields: "id" }} />}
      >
        <gql.FieldDefinition
          name="roles"
          type={code`[${builtInScalars.String}!]!`}
        />
      </gql.ObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend type User implements Node @key(fields: "id") {
        roles: [String!]!
      }
    `);
  });

  it("renders an object extension with field descriptions", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeExtension name="Product">
        <gql.FieldDefinition
          name="rating"
          type={builtInScalars.Float}
          description="Average product rating"
        />
      </gql.ObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend type Product {
        """
        Average product rating
        """
        rating: Float
      }
    `);
  });

  it("renders an object extension with refkey", () => {
    const userRef = refkey();

    const result = toGraphQLText(
      <gql.ObjectTypeExtension name="User" refkey={userRef}>
        <gql.FieldDefinition name="active" type={builtInScalars.Boolean} />
      </gql.ObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend type User {
        active: Boolean
      }
    `);
  });
});
