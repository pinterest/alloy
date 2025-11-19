import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("InterfaceTypeDefinition", () => {
  it("renders a simple interface with fields", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition name="Node">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      interface Node {
        id: ID!
      }
    `);
  });

  it("renders an interface with multiple fields", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition name="Timestamped">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition
          name="createdAt"
          type={code`${builtInScalars.String}!`}
        />
        <gql.FieldDefinition
          name="updatedAt"
          type={code`${builtInScalars.String}!`}
        />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      interface Timestamped {
        id: ID!
        createdAt: String!
        updatedAt: String!
      }
    `);
  });

  it("renders an interface with documentation", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition
        name="Node"
        description="An object with a unique identifier"
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      """
      An object with a unique identifier
      """
      interface Node {
        id: ID!
      }
    `);
  });

  it("renders an interface with field descriptions", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition name="Node">
        <gql.FieldDefinition
          name="id"
          type={code`${builtInScalars.ID}!`}
          description="Unique identifier for the node"
        />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      interface Node {
        """
        Unique identifier for the node
        """
        id: ID!
      }
    `);
  });

  it("renders an interface that implements another interface", () => {
    const nodeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.InterfaceTypeDefinition>
        <gql.InterfaceTypeDefinition name="Timestamped" implements={[nodeRef]}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition
            name="createdAt"
            type={code`${builtInScalars.String}!`}
          />
        </gql.InterfaceTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      interface Node {
        id: ID!
      }
      
      interface Timestamped implements Node {
        id: ID!
        createdAt: String!
      }
    `);
  });

  it("renders an interface that implements multiple interfaces", () => {
    const nodeRef = refkey();
    const auditedRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.InterfaceTypeDefinition>
        <gql.InterfaceTypeDefinition name="Audited" refkey={auditedRef}>
          <gql.FieldDefinition name="auditLog" type={builtInScalars.String} />
        </gql.InterfaceTypeDefinition>
        <gql.InterfaceTypeDefinition
          name="Timestamped"
          implements={[nodeRef, auditedRef]}
        >
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="auditLog" type={builtInScalars.String} />
          <gql.FieldDefinition
            name="createdAt"
            type={code`${builtInScalars.String}!`}
          />
        </gql.InterfaceTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      interface Node {
        id: ID!
      }
      
      interface Audited {
        auditLog: String
      }
      
      interface Timestamped implements Node & Audited {
        id: ID!
        auditLog: String
        createdAt: String!
      }
    `);
  });

  it("renders an interface with a directive", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition
        name="Node"
        directives={<gql.Directive name="auth" args={{ requires: "ADMIN" }} />}
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      interface Node @auth(requires: "ADMIN") {
        id: ID!
      }
    `);
  });

  it("renders an interface with multiple directives", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition
        name="Node"
        directives={
          <>
            <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
            <gql.Directive name={builtInDirectives.deprecated} />
          </>
        }
      >
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      interface Node @auth(requires: "ADMIN") @deprecated {
        id: ID!
      }
    `);
  });

  it("renders an interface with fields that have arguments", () => {
    const result = toGraphQLText(
      <gql.InterfaceTypeDefinition name="Searchable">
        <gql.FieldDefinition
          name="search"
          type={code`[${builtInScalars.String}!]!`}
          args={
            <>
              <gql.InputValueDefinition
                name="searchQuery"
                type={code`${builtInScalars.String}!`}
              />
              <gql.InputValueDefinition
                name="limit"
                type={builtInScalars.Int}
                defaultValue={10}
              />
            </>
          }
        />
      </gql.InterfaceTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      interface Searchable {
        search(searchQuery: String!, limit: Int = 10): [String!]!
      }
    `);
  });

  it("renders an interface with refkey", () => {
    const nodeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.InterfaceTypeDefinition>
        <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="name" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      interface Node {
        id: ID!
      }
      
      type User implements Node {
        id: ID!
        name: String
      }
    `);
  });

  it("renders an empty interface", () => {
    const result = toGraphQLText(<gql.InterfaceTypeDefinition name="Empty" />);
    expect(result).toRenderTo(d`
      interface Empty {

      }
    `);
  });

  it("renders a complete interface with all features", () => {
    const nodeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.InterfaceTypeDefinition>
        <gql.InterfaceTypeDefinition
          name="Searchable"
          implements={[nodeRef]}
          description="An interface for searchable entities"
          directives={<gql.Directive name="auth" args={{ requires: "USER" }} />}
        >
          <gql.FieldDefinition
            name="id"
            type={code`${builtInScalars.ID}!`}
            description="Unique identifier"
          />
          <gql.FieldDefinition
            name="search"
            type={code`[${builtInScalars.String}!]!`}
            description="Search within this entity"
            args={
              <gql.InputValueDefinition
                name="searchQuery"
                type={code`${builtInScalars.String}!`}
              />
            }
          />
        </gql.InterfaceTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      interface Node {
        id: ID!
      }
      
      """
      An interface for searchable entities
      """
      interface Searchable implements Node @auth(requires: "USER") {
        """
        Unique identifier
        """
        id: ID!
        """
        Search within this entity
        """
        search(searchQuery: String!): [String!]!
      }
    `);
  });
});
