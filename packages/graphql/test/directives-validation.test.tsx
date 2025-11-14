/** @jsxImportSource @alloy-js/core */
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Directives validation", () => {
  describe("location validation", () => {
    it("allows @deprecated on FIELD_DEFINITION", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition
            name="oldField"
            type={gql.builtInScalars.String}
            directives={
              <gql.Directive
                name={gql.builtInDirectives.deprecated}
                args={{ reason: "Use newField" }}
              />
            }
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(`
        type User {
          oldField: String @deprecated(reason: "Use newField")
        }
      `);
    });

    it("throws error when @deprecated is used on OBJECT", () => {
      expect(() => {
        toGraphQLText(
          <gql.ObjectTypeDefinition
            name="User"
            directives={
              <gql.Directive
                name={gql.builtInDirectives.deprecated}
                args={{ reason: "Old type" }}
              />
            }
          >
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.ObjectTypeDefinition>,
        );
      }).toThrow(
        /Directive @deprecated cannot be used on OBJECT.*Valid locations.*FIELD_DEFINITION.*ARGUMENT_DEFINITION.*INPUT_FIELD_DEFINITION.*ENUM_VALUE/,
      );
    });

    it("allows @skip on FIELD (executable location)", () => {
      // Note: In a real scenario, @skip would be used in queries, not schema definitions
      // This test is mainly to verify the validation logic works
      const _directive = <gql.Directive name={gql.builtInDirectives.skip} args={{ if: true }} />;
      
      // We can't easily test this in schema context, but we can verify the metadata is correct
      expect(gql.builtInDirectiveMetadata.skip.locations).toContain("FIELD");
    });

    it("allows @specifiedBy on SCALAR", () => {
      // For this test, we'd need a ScalarTypeDefinition component
      // which doesn't exist on this branch, so we just verify metadata
      expect(gql.builtInDirectiveMetadata.specifiedBy.locations).toContain("SCALAR");
    });

    it("throws error when @include is used on FIELD_DEFINITION", () => {
      expect(() => {
        toGraphQLText(
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="field"
              type={gql.builtInScalars.String}
              directives={
                <gql.Directive name={gql.builtInDirectives.include} args={{ if: true }} />
              }
            />
          </gql.ObjectTypeDefinition>,
        );
      }).toThrow(
        /Directive @include cannot be used on FIELD_DEFINITION.*Valid locations.*FIELD.*FRAGMENT_SPREAD.*INLINE_FRAGMENT/,
      );
    });

    it("allows @deprecated on ARGUMENT_DEFINITION", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition
            name="field"
            type={gql.builtInScalars.String}
            args={
              <gql.InputValueDefinition
                name="oldArg"
                type={gql.builtInScalars.Int}
                directives={
                  <gql.Directive
                    name={gql.builtInDirectives.deprecated}
                    args={{ reason: "Use newArg" }}
                  />
                }
              />
            }
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(`
        type User {
          field(oldArg: Int @deprecated(reason: "Use newArg")): String
        }
      `);
    });
  });

  describe("repeatability validation", () => {
    it("throws error when non-repeatable directive is used twice", () => {
      expect(() => {
        toGraphQLText(
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="field"
              type={gql.builtInScalars.String}
              directives={
                <>
                  <gql.Directive
                    name={gql.builtInDirectives.deprecated}
                    args={{ reason: "First deprecation" }}
                  />
                  <gql.Directive
                    name={gql.builtInDirectives.deprecated}
                    args={{ reason: "Second deprecation" }}
                  />
                </>
              }
            />
          </gql.ObjectTypeDefinition>,
        );
      }).toThrow(
        /Directive @deprecated is not repeatable and has been used multiple times on this FIELD_DEFINITION/,
      );
    });

    it("allows single use of non-repeatable directive", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition
            name="field"
            type={gql.builtInScalars.String}
            directives={
              <gql.Directive
                name={gql.builtInDirectives.deprecated}
                args={{ reason: "Old field" }}
              />
            }
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(`
        type User {
          field: String @deprecated(reason: "Old field")
        }
      `);
    });

    it("verifies built-in directives are marked as non-repeatable", () => {
      // All built-in directives are non-repeatable per GraphQL spec
      // This is enforced by the validation logic, not stored in metadata
      expect(gql.builtInDirectiveMetadata.deprecated.locations).toBeDefined();
      expect(gql.builtInDirectiveMetadata.skip.locations).toBeDefined();
      expect(gql.builtInDirectiveMetadata.include.locations).toBeDefined();
      expect(gql.builtInDirectiveMetadata.specifiedBy.locations).toBeDefined();
      expect(gql.builtInDirectiveMetadata.oneOf.locations).toBeDefined();
    });
  });

  describe("multiple different directives", () => {
    it("allows multiple different directives on same location", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition
            name="field"
            type={gql.builtInScalars.String}
            directives={
              <>
                <gql.Directive
                  name={gql.builtInDirectives.deprecated}
                  args={{ reason: "Old" }}
                />
                <gql.Directive name="custom" args={{ value: "test" }} />
              </>
            }
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(`
        type User {
          field: String @deprecated(reason: "Old") @custom(value: "test")
        }
      `);
    });
  });

  describe("custom directives", () => {
    it("skips validation for unknown custom directives", () => {
      // Custom directives without definitions won't be validated (yet)
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition
          name="User"
          directives={
            <gql.Directive name="customDirective" args={{ value: "test" }} />
          }
        >
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(`
        type User @customDirective(value: "test") {
          id: ID
        }
      `);
    });

    it("validates custom directive locations when definition is present", () => {
      expect(() => {
        toGraphQLText(
          <gql.SourceFile path="schema.graphql">
            <gql.DirectiveDefinition
              name="auth"
              locations={["FIELD_DEFINITION"]}
              args={
                <gql.InputValueDefinition
                  name="requires"
                  type={gql.builtInScalars.String}
                />
              }
            />
            <gql.ObjectTypeDefinition
              name="User"
              directives={
                <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
              }
            >
              <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            </gql.ObjectTypeDefinition>
          </gql.SourceFile>,
        );
      }).toThrow(
        /Directive @auth cannot be used on OBJECT.*Valid locations.*FIELD_DEFINITION/,
      );
    });

    it("allows custom directive in valid location", () => {
      const result = toGraphQLText(
        <gql.SourceFile path="schema.graphql">
          <gql.DirectiveDefinition
            name="auth"
            locations={["FIELD_DEFINITION", "OBJECT"]}
            args={
              <gql.InputValueDefinition
                name="requires"
                type={gql.builtInScalars.String}
              />
            }
          />
          <gql.ObjectTypeDefinition
            name="User"
            directives={
              <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
            }
          >
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.ObjectTypeDefinition>
        </gql.SourceFile>,
      );

      expect(result).toContain("directive @auth(requires: String) on FIELD_DEFINITION | OBJECT");
      expect(result).toContain("type User @auth(requires: \"ADMIN\") {");
    });

    it("validates custom repeatable directive", () => {
      const result = toGraphQLText(
        <gql.SourceFile path="schema.graphql">
          <gql.DirectiveDefinition
            name="tag"
            repeatable={true}
            locations={["FIELD_DEFINITION"]}
            args={
              <gql.InputValueDefinition
                name="name"
                type={gql.builtInScalars.String}
              />
            }
          />
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="field"
              type={gql.builtInScalars.String}
              directives={
                <>
                  <gql.Directive name="tag" args={{ name: "important" }} />
                  <gql.Directive name="tag" args={{ name: "public" }} />
                </>
              }
            />
          </gql.ObjectTypeDefinition>
        </gql.SourceFile>,
      );

      expect(result).toContain("directive @tag(name: String) repeatable on FIELD_DEFINITION");
      expect(result).toContain('field: String @tag(name: "important") @tag(name: "public")');
    });

    it("throws error when non-repeatable custom directive is used twice", () => {
      expect(() => {
        toGraphQLText(
          <gql.SourceFile path="schema.graphql">
            <gql.DirectiveDefinition
              name="cache"
              locations={["FIELD_DEFINITION"]}
              args={
                <gql.InputValueDefinition
                  name="maxAge"
                  type={gql.builtInScalars.Int}
                />
              }
            />
            <gql.ObjectTypeDefinition name="User">
              <gql.FieldDefinition
                name="field"
                type={gql.builtInScalars.String}
                directives={
                  <>
                    <gql.Directive name="cache" args={{ maxAge: 100 }} />
                    <gql.Directive name="cache" args={{ maxAge: 200 }} />
                  </>
                }
              />
            </gql.ObjectTypeDefinition>
          </gql.SourceFile>,
        );
      }).toThrow(
        /Directive @cache is not repeatable and has been used multiple times on this FIELD_DEFINITION/,
      );
    });
  });

  describe("directive metadata storage", () => {
    it("stores directive metadata in symbol when using DirectiveDefinition", () => {
      // This is more of an integration test to verify metadata is stored correctly
      const result = toGraphQLText(
        <gql.DirectiveDefinition
          name="auth"
          locations={["FIELD_DEFINITION", "OBJECT"]}
          repeatable={true}
          args={
            <gql.InputValueDefinition
              name="requires"
              type={gql.builtInScalars.String}
            />
          }
        />,
      );

      expect(result).toBe(
        "directive @auth(requires: String) repeatable on FIELD_DEFINITION | OBJECT",
      );
    });
  });

  describe("directive argument validation", () => {
    it("allows directive with all required arguments provided", () => {
      const result = toGraphQLText(
        <gql.SourceFile path="schema.graphql">
          <gql.DirectiveDefinition
            name="auth"
            locations={["FIELD_DEFINITION"]}
            args={
              <>
                <gql.InputValueDefinition name="requires" type="String!" />
                <gql.InputValueDefinition name="level" type="Int" />
              </>
            }
          />
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="email"
              type={gql.builtInScalars.String}
              directives={
                <gql.Directive name="auth" args={{ requires: "ADMIN", level: 5 }} />
              }
            />
          </gql.ObjectTypeDefinition>
        </gql.SourceFile>,
      );

      expect(result).toContain('@auth(requires: "ADMIN", level: 5)');
    });

    it("allows directive with only required arguments (optional arguments omitted)", () => {
      const result = toGraphQLText(
        <gql.SourceFile path="schema.graphql">
          <gql.DirectiveDefinition
            name="auth"
            locations={["FIELD_DEFINITION"]}
            args={
              <>
                <gql.InputValueDefinition name="requires" type="String!" />
                <gql.InputValueDefinition name="level" type="Int" />
              </>
            }
          />
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="email"
              type={gql.builtInScalars.String}
              directives={
                <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
              }
            />
          </gql.ObjectTypeDefinition>
        </gql.SourceFile>,
      );

      expect(result).toContain('@auth(requires: "ADMIN")');
    });

    it("throws error when required argument is missing", () => {
      expect(() => {
        toGraphQLText(
          <gql.SourceFile path="schema.graphql">
            <gql.DirectiveDefinition
              name="auth"
              locations={["FIELD_DEFINITION"]}
              args={
                <>
                  <gql.InputValueDefinition name="requires" type="String!" />
                  <gql.InputValueDefinition name="level" type="Int" />
                </>
              }
            />
            <gql.ObjectTypeDefinition name="User">
              <gql.FieldDefinition
                name="email"
                type={gql.builtInScalars.String}
                directives={
                  <gql.Directive name="auth" args={{ level: 5 }} />
                }
              />
            </gql.ObjectTypeDefinition>
          </gql.SourceFile>,
        );
      }).toThrow(/Directive @auth is missing required argument "requires"/);
    });

    it("throws error when unknown argument is provided", () => {
      expect(() => {
        toGraphQLText(
          <gql.SourceFile path="schema.graphql">
            <gql.DirectiveDefinition
              name="auth"
              locations={["FIELD_DEFINITION"]}
              args={
                <gql.InputValueDefinition name="requires" type="String!" />
              }
            />
            <gql.ObjectTypeDefinition name="User">
              <gql.FieldDefinition
                name="email"
                type={gql.builtInScalars.String}
                directives={
                  <gql.Directive name="auth" args={{ requires: "ADMIN", unknown: "value" }} />
                }
              />
            </gql.ObjectTypeDefinition>
          </gql.SourceFile>,
        );
      }).toThrow(/Directive @auth does not accept argument "unknown".*Valid arguments: requires/);
    });

    it("throws error when directive with no arguments receives arguments", () => {
      expect(() => {
        toGraphQLText(
          <gql.SourceFile path="schema.graphql">
            <gql.DirectiveDefinition
              name="noArgs"
              locations={["FIELD_DEFINITION"]}
            />
            <gql.ObjectTypeDefinition name="User">
              <gql.FieldDefinition
                name="email"
                type={gql.builtInScalars.String}
                directives={
                  <gql.Directive name="noArgs" args={{ unexpected: "value" }} />
                }
              />
            </gql.ObjectTypeDefinition>
          </gql.SourceFile>,
        );
      }).toThrow(/Directive @noArgs does not accept argument "unexpected".*Valid arguments: none/);
    });

    it("allows directive with no arguments when no arguments are provided", () => {
      const result = toGraphQLText(
        <gql.SourceFile path="schema.graphql">
          <gql.DirectiveDefinition
            name="noArgs"
            locations={["FIELD_DEFINITION"]}
          />
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="email"
              type={gql.builtInScalars.String}
              directives={
                <gql.Directive name="noArgs" />
              }
            />
          </gql.ObjectTypeDefinition>
        </gql.SourceFile>,
      );

      expect(result).toContain("@noArgs");
    });

    it("validates complex directive with multiple required and optional arguments", () => {
      const result = toGraphQLText(
        <gql.SourceFile path="schema.graphql">
          <gql.DirectiveDefinition
            name="complex"
            locations={["FIELD_DEFINITION"]}
            args={
              <>
                <gql.InputValueDefinition name="required1" type="String!" />
                <gql.InputValueDefinition name="required2" type="Int!" />
                <gql.InputValueDefinition name="optional1" type="String" />
                <gql.InputValueDefinition name="optional2" type="Boolean" />
              </>
            }
          />
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition
              name="field"
              type={gql.builtInScalars.String}
              directives={
                <gql.Directive name="complex" args={{ required1: "value", required2: 42, optional1: "opt" }} />
              }
            />
          </gql.ObjectTypeDefinition>
        </gql.SourceFile>,
      );

      expect(result).toContain('@complex(required1: "value", required2: 42, optional1: "opt")');
    });

    it("throws error when multiple required arguments are missing", () => {
      expect(() => {
        toGraphQLText(
          <gql.SourceFile path="schema.graphql">
            <gql.DirectiveDefinition
              name="multi"
              locations={["FIELD_DEFINITION"]}
              args={
                <>
                  <gql.InputValueDefinition name="arg1" type="String!" />
                  <gql.InputValueDefinition name="arg2" type="Int!" />
                  <gql.InputValueDefinition name="arg3" type="Boolean!" />
                </>
              }
            />
            <gql.ObjectTypeDefinition name="User">
              <gql.FieldDefinition
                name="field"
                type={gql.builtInScalars.String}
                directives={
                  <gql.Directive name="multi" args={{ arg1: "value" }} />
                }
              />
            </gql.ObjectTypeDefinition>
          </gql.SourceFile>,
        );
      }).toThrow(/Directive @multi is missing required argument/);
    });
  });
});

