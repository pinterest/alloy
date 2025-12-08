import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("InterfaceTypeExtension", () => {
  it("renders an interface extension with additional fields", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeExtension name="Node">
        <gql.FieldDefinition name="createdAt" type={builtInScalars.String} />
      </gql.InterfaceTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend interface Node {
        createdAt: String
      }
    `);
  });

  it("renders an interface extension with implements", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeExtension name="Timestamped" implements={["Node"]} />,
    );
    expect(result).toRenderTo(d`
      extend interface Timestamped implements Node
    `);
  });

  it("renders an interface extension with directives", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeExtension
        name="Entity"
        directives={<gql.Directive name="key" args={{ fields: "id" }} />}
      />,
    );
    expect(result).toRenderTo(d`
      extend interface Entity @key(fields: "id")
    `);
  });

  it("renders an interface extension with all features", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeExtension
        name="Audited"
        implements={["Node"]}
        directives={<gql.Directive name="shareable" />}
      >
        <gql.FieldDefinition
          name="auditLog"
          type={
            <gql.TypeReference
              type={<gql.TypeReference type={builtInScalars.String} required />}
              list
              required
            />
          }
        />
      </gql.InterfaceTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend interface Audited implements Node @shareable {
        auditLog: [String!]!
      }
    `);
  });

  it("renders an interface extension with refkey", () => {
    const auditedRef = refkey();

    const result = toGraphQLText(
      <gql.InterfaceTypeExtension name="Audited" refkey={auditedRef}>
        <gql.FieldDefinition name="deletedAt" type={builtInScalars.String} />
      </gql.InterfaceTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend interface Audited {
        deletedAt: String
      }
    `);
  });
});
