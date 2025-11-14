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
    expect(result).toRenderTo(`
      type User implements Node {
        id: ID
      }
    `);
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
    expect(result).toRenderTo(`
      type User implements Node & Timestamped & Auditable {
        id: ID
      }
    `);
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
    expect(result).toRenderTo(`
      type Node {
        id: ID
      }

      type Timestamped {
        createdAt: String
      }

      type User implements Node & Timestamped {
        id: ID
        createdAt: String
      }
    `);
  });

  it("does not render when array is empty", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User" implements={[]}>
        <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(`
      type User {
        id: ID
      }
    `);
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
    expect(result).toRenderTo(`
      type User implements Node @auth(requires: "ADMIN") {
        id: ID
      }
    `);
  });

  it("automatically includes transitive interfaces (single level)", () => {
    const nodeRef = refkey();
    const timestampedRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="Timestamped"
          refkey={timestampedRef}
          implements={[nodeRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="User" implements={[timestampedRef]}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    // User implements Timestamped, which implements Node,
    // so User should automatically implement both
    expect(result).toRenderTo(`
      type Node {
        id: ID
      }

      type Timestamped implements Node {
        id: ID
        createdAt: String
      }

      type User implements Timestamped & Node {
        id: ID
        createdAt: String
      }
    `);
  });

  it("automatically includes transitive interfaces (multiple levels)", () => {
    const entityRef = refkey();
    const nodeRef = refkey();
    const timestampedRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Entity" refkey={entityRef}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="Node"
          refkey={nodeRef}
          implements={[entityRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="Timestamped"
          refkey={timestampedRef}
          implements={[nodeRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="User" implements={[timestampedRef]}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    // User implements Timestamped, which implements Node, which implements Entity
    expect(result).toRenderTo(`
      type Entity {
        id: ID
      }

      type Node implements Entity {
        id: ID
      }

      type Timestamped implements Node & Entity {
        id: ID
        createdAt: String
      }

      type User implements Timestamped & Node & Entity {
        id: ID
        createdAt: String
      }
    `);
  });

  it("handles diamond-shaped interface hierarchies without duplicates", () => {
    const nodeRef = refkey();
    const timestampedRef = refkey();
    const auditableRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="Timestamped"
          refkey={timestampedRef}
          implements={[nodeRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="Auditable"
          refkey={auditableRef}
          implements={[nodeRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="updatedBy"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="User"
          implements={[timestampedRef, auditableRef]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition
            name="createdAt"
            type={gql.builtInScalars.String}
          />
          <gql.FieldDefinition
            name="updatedBy"
            type={gql.builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    // User implements both Timestamped and Auditable, which both implement Node
    // Node should only appear once in the implements list
    expect(result).toRenderTo(`
      type Node {
        id: ID
      }

      type Timestamped implements Node {
        id: ID
        createdAt: String
      }

      type Auditable implements Node {
        id: ID
        updatedBy: String
      }

      type User implements Timestamped & Node & Auditable {
        id: ID
        createdAt: String
        updatedBy: String
      }
    `);
  });

  it("handles mix of refkeys and string literals", () => {
    const nodeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition
          name="User"
          implements={[nodeRef, "Timestamped"]}
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(`
      type Node {
        id: ID
      }

      type User implements Node & Timestamped {
        id: ID
      }
    `);
  });
});
