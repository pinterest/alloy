import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Name Uniqueness Validation", () => {
  describe("Type-level name uniqueness", () => {
    it("allows unique type names", () => {
      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.ObjectTypeDefinition>
          <gql.ObjectTypeDefinition name="Post">
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("handles duplicate object type names (last definition wins)", () => {
      // Note: The core system doesn't throw an error for duplicate type names.
      // Instead, the last definition wins (this is similar to GraphQL schema merging behavior).
      // This test verifies that behavior.
      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.ObjectTypeDefinition>
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      // The result should contain the second definition
      expect(result).toContain("type User");
      expect(result).toContain("name: String");
    });

    it("detects duplicate directive names", () => {
      expect(() => {
        toGraphQLText(
          <>
            <gql.DirectiveDefinition
              name="custom"
              locations={["FIELD_DEFINITION"]}
            />
            <gql.DirectiveDefinition name="custom" locations={["OBJECT"]} />
          </>,
        );
      }).toThrow(/Directive @custom is already defined/);
    });
  });

  describe("Field-level name uniqueness", () => {
    it("allows unique field names in object types", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={gql.builtInScalars.ID} />}
          />
          <gql.FieldDefinition
            name="name"
            type={<gql.TypeReference type={gql.builtInScalars.String} />}
          />
          <gql.FieldDefinition
            name="email"
            type={<gql.TypeReference type={gql.builtInScalars.String} />}
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toBeDefined();
    });

    it("detects duplicate field names in object types", () => {
      expect(() => {
        toGraphQLText(
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>,
        );
      }).toThrow();
    });

    it("detects duplicate field names in interfaces", () => {
      expect(() => {
        toGraphQLText(
          <gql.InterfaceTypeDefinition name="Node">
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.InterfaceTypeDefinition>,
        );
      }).toThrow();
    });

    it("detects duplicate input field names", () => {
      expect(() => {
        toGraphQLText(
          <gql.InputObjectTypeDefinition name="UserInput">
            <gql.InputFieldDeclaration
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
            <gql.InputFieldDeclaration
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.InputObjectTypeDefinition>,
        );
      }).toThrow();
    });
  });

  describe("Enum value name uniqueness", () => {
    it("allows unique enum values", () => {
      const result = toGraphQLText(
        <gql.EnumTypeDefinition name="Status">
          <gql.EnumValue name="ACTIVE" />
          <gql.EnumValue name="INACTIVE" />
          <gql.EnumValue name="PENDING" />
        </gql.EnumTypeDefinition>,
      );

      expect(result).toBeDefined();
    });

    it("detects duplicate enum value names", () => {
      expect(() => {
        toGraphQLText(
          <gql.EnumTypeDefinition name="Status">
            <gql.EnumValue name="ACTIVE" />
            <gql.EnumValue name="ACTIVE" />
          </gql.EnumTypeDefinition>,
        );
      }).toThrow();
    });
  });

  describe("Argument name uniqueness", () => {
    it("allows unique argument names", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="user"
            type={<gql.TypeReference type={gql.builtInScalars.String} />}
            args={
              <>
                <gql.InputValueDefinition
                  name="id"
                  type={<gql.TypeReference type={gql.builtInScalars.ID} />}
                />
                <gql.InputValueDefinition
                  name="name"
                  type={<gql.TypeReference type={gql.builtInScalars.String} />}
                />
              </>
            }
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toBeDefined();
    });

    it("detects duplicate argument names", () => {
      expect(() => {
        toGraphQLText(
          <gql.ObjectTypeDefinition name="Query">
            <gql.FieldDefinition
              name="user"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <>
                  <gql.InputValueDefinition
                    name="id"
                    type={<gql.TypeReference type={gql.builtInScalars.ID} />}
                  />
                  <gql.InputValueDefinition
                    name="id"
                    type={<gql.TypeReference type={gql.builtInScalars.String} />}
                  />
                </>
              }
            />
          </gql.ObjectTypeDefinition>,
        );
      }).toThrow();
    });
  });
});
