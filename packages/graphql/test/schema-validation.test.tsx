import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Schema Root Type Validation", () => {
  describe("SchemaDefinition validation", () => {
    it("allows object types for query root", () => {
      const queryRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="Query" refkey={queryRef}>
            <gql.FieldDefinition
              name="hello"
              type={gql.builtInScalars.String}
            />
          </gql.ObjectTypeDefinition>
          <gql.SchemaDefinition query={queryRef} />
        </>,
      );

      expect(result).toRenderTo(d`
        type Query {
          hello: String
        }

        schema {
          query: Query
        }
      `);
    });

    it("allows object types for all root types", () => {
      const queryRef = refkey();
      const mutationRef = refkey();
      const subscriptionRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="Query" refkey={queryRef}>
            <gql.FieldDefinition
              name="hello"
              type={gql.builtInScalars.String}
            />
          </gql.ObjectTypeDefinition>
          <gql.ObjectTypeDefinition name="Mutation" refkey={mutationRef}>
            <gql.FieldDefinition
              name="doSomething"
              type={gql.builtInScalars.Boolean}
            />
          </gql.ObjectTypeDefinition>
          <gql.ObjectTypeDefinition
            name="Subscription"
            refkey={subscriptionRef}
          >
            <gql.FieldDefinition
              name="onEvent"
              type={gql.builtInScalars.String}
            />
          </gql.ObjectTypeDefinition>
          <gql.SchemaDefinition
            query={queryRef}
            mutation={mutationRef}
            subscription={subscriptionRef}
          />
        </>,
      );

      expect(result).toRenderTo(d`
        type Query {
          hello: String
        }

        type Mutation {
          doSomething: Boolean
        }

        type Subscription {
          onEvent: String
        }

        schema {
          query: Query
          mutation: Mutation
          subscription: Subscription
        }
      `);
    });

    it("throws error when query type is an interface", () => {
      const queryRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition name="IQuery" refkey={queryRef}>
              <gql.FieldDefinition
                name="hello"
                type={gql.builtInScalars.String}
              />
            </gql.InterfaceTypeDefinition>
            <gql.SchemaDefinition query={queryRef} />
          </>,
        );
      }).toThrow(
        /Schema query type must be an object type, but "IQuery" is a interface/,
      );
    });

    it("throws error when mutation type is a union", () => {
      const queryRef = refkey();
      const mutationRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ObjectTypeDefinition name="Query" refkey={queryRef}>
              <gql.FieldDefinition
                name="hello"
                type={gql.builtInScalars.String}
              />
            </gql.ObjectTypeDefinition>
            <gql.UnionTypeDefinition
              name="MutationUnion"
              refkey={mutationRef}
              members={["User", "Post"]}
            />
            <gql.SchemaDefinition query={queryRef} mutation={mutationRef} />
          </>,
        );
      }).toThrow(
        /Schema mutation type must be an object type, but "MutationUnion" is a union/,
      );
    });

    it("throws error when subscription type is an input object", () => {
      const queryRef = refkey();
      const subscriptionRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ObjectTypeDefinition name="Query" refkey={queryRef}>
              <gql.FieldDefinition
                name="hello"
                type={gql.builtInScalars.String}
              />
            </gql.ObjectTypeDefinition>
            <gql.InputObjectTypeDefinition
              name="SubscriptionInput"
              refkey={subscriptionRef}
            >
              <gql.InputFieldDeclaration
                name="topic"
                type={gql.builtInScalars.String}
              />
            </gql.InputObjectTypeDefinition>
            <gql.SchemaDefinition
              query={queryRef}
              subscription={subscriptionRef}
            />
          </>,
        );
      }).toThrow(
        /Schema subscription type must be an object type, but "SubscriptionInput" is a input/,
      );
    });

    it("throws error when query type is an enum", () => {
      const queryRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.EnumTypeDefinition name="QueryEnum" refkey={queryRef}>
              <gql.EnumValue name="GET" />
            </gql.EnumTypeDefinition>
            <gql.SchemaDefinition query={queryRef} />
          </>,
        );
      }).toThrow(
        /Schema query type must be an object type, but "QueryEnum" is a enum/,
      );
    });

    it("throws error when query type is a scalar", () => {
      const queryRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ScalarTypeDefinition name="QueryScalar" refkey={queryRef} />
            <gql.SchemaDefinition query={queryRef} />
          </>,
        );
      }).toThrow(
        /Schema query type must be an object type, but "QueryScalar" is a scalar/,
      );
    });
  });

  describe("SchemaExtension validation", () => {
    it("allows object types for query extension", () => {
      const queryRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="ExtendedQuery" refkey={queryRef}>
            <gql.FieldDefinition
              name="newField"
              type={gql.builtInScalars.String}
            />
          </gql.ObjectTypeDefinition>
          <gql.SchemaExtension query={queryRef} />
        </>,
      );

      expect(result).toRenderTo(d`
        type ExtendedQuery {
          newField: String
        }

        extend schema {
          query: ExtendedQuery
        }
      `);
    });

    it("throws error when extended query type is an interface", () => {
      const queryRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition name="IQuery" refkey={queryRef}>
              <gql.FieldDefinition
                name="hello"
                type={gql.builtInScalars.String}
              />
            </gql.InterfaceTypeDefinition>
            <gql.SchemaExtension query={queryRef} />
          </>,
        );
      }).toThrow(
        /Schema query type must be an object type, but "IQuery" is a interface/,
      );
    });

    it("throws error when extended mutation type is a union", () => {
      const mutationRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.UnionTypeDefinition
              name="MutationUnion"
              refkey={mutationRef}
              members={["User", "Post"]}
            />
            <gql.SchemaExtension mutation={mutationRef} />
          </>,
        );
      }).toThrow(
        /Schema mutation type must be an object type, but "MutationUnion" is a union/,
      );
    });
  });
});
