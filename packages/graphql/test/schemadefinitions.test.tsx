import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import {
  assertFileContents,
  toGraphQLText,
  toGraphQLTextMultiple,
} from "./utils.jsx";

describe("SchemaDefinition", () => {
  it("renders a schema with query only", () => {
    const result = toGraphQLText(<gql.SchemaDefinition query="Query" />);
    expect(result).toRenderTo(d`
      schema {
        query: Query
      }
    `);
  });

  it("renders a schema with all operation types", () => {
    const result = toGraphQLText(
      <gql.SchemaDefinition
        query="Query"
        mutation="Mutation"
        subscription="Subscription"
      />,
    );
    expect(result).toRenderTo(d`
      schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
      }
    `);
  });

  it("renders a schema with documentation", () => {
    const result = toGraphQLText(
      <gql.SchemaDefinition
        query="Query"
        description={`"""\nMain schema definition for the API\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      Main schema definition for the API
      """
      schema {
        query: Query
      }
    `);
  });

  it("renders a schema with a directive", () => {
    const result = toGraphQLText(
      <gql.SchemaDefinition
        query="Query"
        directives={
          <gql.Directive
            name="link"
            args={{ url: "https://specs.apollo.dev/federation/v2.0" }}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      schema @link(url: "https://specs.apollo.dev/federation/v2.0") {
        query: Query
      }
    `);
  });

  it("renders a schema with multiple directives", () => {
    const result = toGraphQLText(
      <gql.SchemaDefinition
        query="Query"
        mutation="Mutation"
        directives={
          <>
            <gql.Directive
              name="link"
              args={{ url: "https://specs.apollo.dev/federation/v2.0" }}
            />
            <gql.Directive name="auth" args={{ enabled: true }} />
          </>
        }
      />,
    );
    expect(result).toRenderTo(d`
      schema @link(url: "https://specs.apollo.dev/federation/v2.0") @auth(enabled: true) {
        query: Query
        mutation: Mutation
      }
    `);
  });

  it("renders a schema with refkeys", () => {
    const queryRef = refkey();
    const mutationRef = refkey();
    const subscriptionRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Query" refkey={queryRef}>
          <gql.FieldDefinition name="user" type="User" />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Mutation" refkey={mutationRef}>
          <gql.FieldDefinition name="createUser" type="User!" />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Subscription" refkey={subscriptionRef}>
          <gql.FieldDefinition name="userCreated" type="User!" />
        </gql.ObjectTypeDefinition>
        <gql.SchemaDefinition
          query={queryRef}
          mutation={mutationRef}
          subscription={subscriptionRef}
          description={`"""\nMain API schema\n"""`}
        />
      </>,
    );

    expect(result).toRenderTo(d`
      type Query {
        user: User
      }
      
      type Mutation {
        createUser: User!
      }
      
      type Subscription {
        userCreated: User!
      }
      
      """
      Main API schema
      """
      schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
      }
    `);
  });

  it("supports cross-file schema references", () => {
    const queryRef = refkey();
    const mutationRef = refkey();

    const res = toGraphQLTextMultiple([
      <gql.SourceFile path="operations.graphql">
        <gql.ObjectTypeDefinition name="Query" refkey={queryRef}>
          <gql.FieldDefinition name="hello" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Mutation" refkey={mutationRef}>
          <gql.FieldDefinition name="noop" type={builtInScalars.Boolean} />
        </gql.ObjectTypeDefinition>
      </gql.SourceFile>,
      <gql.SourceFile path="schema.graphql">
        <gql.SchemaDefinition query={queryRef} mutation={mutationRef} />
      </gql.SourceFile>,
    ]);

    assertFileContents(res, {
      "operations.graphql": `
        type Query {
          hello: String
        }
        
        type Mutation {
          noop: Boolean
        }
      `,
      "schema.graphql": `
        schema {
          query: Query
          mutation: Mutation
        }
      `,
    });
  });

  it("throws an error when no operations are specified", () => {
    expect(() => {
      toGraphQLText(<gql.SchemaDefinition />);
    }).toThrow("SchemaDefinition requires at least one operation type");
  });
});
