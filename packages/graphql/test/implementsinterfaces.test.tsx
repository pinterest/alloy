/** @jsxImportSource @alloy-js/core */
import { refkey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("ImplementsInterfaces", () => {
  it("renders a single interface", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User" implements={["Node"]}>
        <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toContain("type User implements Node {");
  });

  it("renders multiple interfaces with ampersand separator", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition
        name="User"
        implements={["Node", "Timestamped", "Auditable"]}
      >
        <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toContain(
      "type User implements Node & Timestamped & Auditable {",
    );
  });

  it("renders interfaces using refkeys", () => {
    const nodeRef = refkey();
    const timestampedRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Timestamped" refkey={timestampedRef}>
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="User"
          implements={[nodeRef, timestampedRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toContain("type User implements Node & Timestamped {");
  });

  it("does not render when array is empty", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User" implements={[]}>
        <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).not.toContain("implements");
  });

  it("maintains correct spacing with directives", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition
        name="User"
        implements={["Node"]}
        directives={<gql.Directive name="auth" args={{ requires: "ADMIN" }} />}
      >
        <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toContain("type User implements Node @auth");
  });
});
