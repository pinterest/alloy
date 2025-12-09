import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Circular Reference Detection", () => {
  describe("Interface inheritance cycles", () => {
    it("allows non-circular interface inheritance", () => {
      const nodeRef = refkey();
      const timestampedRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition
            name="Timestamped"
            refkey={timestampedRef}
            implements={[nodeRef]}
          >
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="createdAt"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[timestampedRef]}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="createdAt"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        interface Node {
          id: ID
        }

        interface Timestamped implements Node {
          id: ID
          createdAt: String
        }

        type User implements Timestamped & Node {
          id: ID
          createdAt: String
          name: String
        }
      `);
    });

    it("detects direct circular inheritance (A implements B, B implements A)", () => {
      const aRef = refkey();
      const bRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition
              name="A"
              refkey={aRef}
              implements={[bRef]}
            >
              <gql.FieldDefinition
                name="field"
                type={<gql.TypeReference type={gql.builtInScalars.String} />}
              />
            </gql.InterfaceTypeDefinition>
            <gql.InterfaceTypeDefinition
              name="B"
              refkey={bRef}
              implements={[aRef]}
            >
              <gql.FieldDefinition
                name="field"
                type={<gql.TypeReference type={gql.builtInScalars.String} />}
              />
            </gql.InterfaceTypeDefinition>
          </>,
        );
      }).toThrow(/Circular interface inheritance detected/);
    });

    it("detects indirect circular inheritance (A -> B -> C -> A)", () => {
      const aRef = refkey();
      const bRef = refkey();
      const cRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition
              name="A"
              refkey={aRef}
              implements={[bRef]}
            >
              <gql.FieldDefinition
                name="field"
                type={<gql.TypeReference type={gql.builtInScalars.String} />}
              />
            </gql.InterfaceTypeDefinition>
            <gql.InterfaceTypeDefinition
              name="B"
              refkey={bRef}
              implements={[cRef]}
            >
              <gql.FieldDefinition
                name="field"
                type={<gql.TypeReference type={gql.builtInScalars.String} />}
              />
            </gql.InterfaceTypeDefinition>
            <gql.InterfaceTypeDefinition
              name="C"
              refkey={cRef}
              implements={[aRef]}
            >
              <gql.FieldDefinition
                name="field"
                type={<gql.TypeReference type={gql.builtInScalars.String} />}
              />
            </gql.InterfaceTypeDefinition>
          </>,
        );
      }).toThrow(/Circular interface inheritance detected/);
    });

    it("detects self-referential interface", () => {
      const aRef = refkey();

      expect(() => {
        toGraphQLText(
          <gql.InterfaceTypeDefinition
            name="A"
            refkey={aRef}
            implements={[aRef]}
          >
            <gql.FieldDefinition
              name="field"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.InterfaceTypeDefinition>,
        );
      }).toThrow(/Circular interface inheritance detected/);
    });
  });

  // Note: Circular references in object types and input objects are allowed
  // in GraphQL as long as they're nullable. These are NOT validated at generation
  // time since they're valid according to the GraphQL spec. Only interface
  // inheritance cycles are problematic and detected above.
});
