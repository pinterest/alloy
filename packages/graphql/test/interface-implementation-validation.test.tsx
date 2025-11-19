import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { getLastValidationErrors, toGraphQLText } from "./utils.jsx";

describe("Interface Implementation Validation", () => {
  describe("Field presence validation", () => {
    it("allows a type that implements all interface fields", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        interface Node {
          id: ID
        }

        type User implements Node {
          id: ID
          name: String
        }
      `);
    });

    it("throws when type is missing an interface field", () => {
      const nodeRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "User" must implement field "id" from interface "Node"/,
      );
    });

    it("validates transitive interface implementation", () => {
      const nodeRef = refkey();
      const timestampedRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition
            name="Timestamped"
            refkey={timestampedRef}
            implements={[nodeRef]}
          >
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            <gql.FieldDefinition
              name="createdAt"
              type={gql.builtInScalars.String}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[timestampedRef]}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            <gql.FieldDefinition
              name="createdAt"
              type={gql.builtInScalars.String}
            />
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("throws when type is missing a transitive interface field", () => {
      const nodeRef = refkey();
      const timestampedRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition
            name="Timestamped"
            refkey={timestampedRef}
            implements={[nodeRef]}
          >
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            <gql.FieldDefinition
              name="createdAt"
              type={gql.builtInScalars.String}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[timestampedRef]}>
            <gql.FieldDefinition
              name="createdAt"
              type={gql.builtInScalars.String}
            />
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "User" must implement field "id" from interface "Timestamped"/,
      );
    });
  });

  describe("Field return type validation", () => {
    it("allows matching return types", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type="ID!" />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition name="id" type="ID!" />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("throws when return type doesn't match", () => {
      const nodeRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type="ID!" />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.String} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "User" field "id" return type must be "ID!" to match interface "Node", but found "String"/,
      );
    });

    it("throws when nullability doesn't match", () => {
      const nodeRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type="ID!" />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "User" field "id" return type must be "ID!" to match interface "Node", but found "ID"/,
      );
    });
  });

  describe("Field arguments validation", () => {
    it("allows fields with matching arguments", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={`${gql.builtInScalars.Int}!`}
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={`${gql.builtInScalars.Int}!`}
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("throws when argument count doesn't match", () => {
      const nodeRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={`${gql.builtInScalars.Int}!`}
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "GitHubRepo" field "issue" must have 1 argument\(s\) to match interface "Repository", but has 0/,
      );
    });

    it("throws when argument name doesn't match", () => {
      const nodeRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={`${gql.builtInScalars.Int}!`}
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="id"
                  type={`${gql.builtInScalars.Int}!`}
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "GitHubRepo" field "issue" argument at position 1 must be named "number" to match interface "Repository", but found "id"/,
      );
    });

    it("throws when argument type doesn't match", () => {
      const nodeRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={`${gql.builtInScalars.Int}!`}
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={gql.builtInScalars.String}
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "GitHubRepo" field "issue" argument "number" must have type "Int!" to match interface "Repository", but found "String"/,
      );
    });

    it("allows fields with multiple matching arguments", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issues"
              type="[String!]!"
              args={
                <>
                  <gql.InputValueDefinition
                    name="first"
                    type={gql.builtInScalars.Int}
                  />
                  <gql.InputValueDefinition
                    name="after"
                    type={gql.builtInScalars.String}
                  />
                </>
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issues"
              type="[String!]!"
              args={
                <>
                  <gql.InputValueDefinition
                    name="first"
                    type={gql.builtInScalars.Int}
                  />
                  <gql.InputValueDefinition
                    name="after"
                    type={gql.builtInScalars.String}
                  />
                </>
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });
  });

  describe("Multiple interfaces", () => {
    it("validates implementation of multiple interfaces", () => {
      const nodeRef = refkey();
      const namedRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition name="Named" refkey={namedRef}>
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition
            name="User"
            implements={[nodeRef, namedRef]}
          >
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("throws when type is missing a field from one of multiple interfaces", () => {
      const nodeRef = refkey();
      const namedRef = refkey();

      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition name="Named" refkey={namedRef}>
            <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition
            name="User"
            implements={[nodeRef, namedRef]}
          >
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      const errors = getLastValidationErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Type "User" must implement field "name" from interface "Named"/,
      );
    });
  });
});
