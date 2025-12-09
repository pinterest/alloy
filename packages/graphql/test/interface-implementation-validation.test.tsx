import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText, toGraphQLTextWithErrors } from "./utils.jsx";

describe("Interface Implementation Validation", () => {
  describe("Field presence validation", () => {
    it("allows a type that implements all interface fields", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
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

        type User implements Node {
          id: ID
          name: String
        }
      `);
    });

    it("throws when type is missing an interface field", () => {
      const nodeRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "User" does not correctly implement interface "Node".',
      );
    });

    it("validates transitive interface implementation", () => {
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

      expect(result).toBeDefined();
    });

    it("throws when type is missing a transitive interface field", () => {
      const nodeRef = refkey();
      const timestampedRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
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

      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe(
        'Type "User" does not correctly implement interface "Timestamped".',
      );
      expect(errors[1].message).toBe(
        'Type "User" does not correctly implement interface "Node".',
      );
    });
  });

  describe("Field return type validation", () => {
    it("allows matching return types", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("throws when return type doesn't match", () => {
      const nodeRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "User" does not correctly implement interface "Node".',
      );
    });

    it("throws when nullability doesn't match", () => {
      const nodeRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "User" does not correctly implement interface "Node".',
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
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={
                    <gql.TypeReference type={gql.builtInScalars.Int} required />
                  }
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={
                    <gql.TypeReference type={gql.builtInScalars.Int} required />
                  }
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

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={
                    <gql.TypeReference type={gql.builtInScalars.Int} required />
                  }
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "GitHubRepo" does not correctly implement interface "Repository".',
      );
    });

    it("throws when argument name doesn't match", () => {
      const nodeRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={
                    <gql.TypeReference type={gql.builtInScalars.Int} required />
                  }
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="id"
                  type={
                    <gql.TypeReference type={gql.builtInScalars.Int} required />
                  }
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "GitHubRepo" does not correctly implement interface "Repository".',
      );
    });

    it("throws when argument type doesn't match", () => {
      const nodeRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={
                    <gql.TypeReference type={gql.builtInScalars.Int} required />
                  }
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issue"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
              args={
                <gql.InputValueDefinition
                  name="number"
                  type={<gql.TypeReference type={gql.builtInScalars.String} />}
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "GitHubRepo" does not correctly implement interface "Repository".',
      );
    });

    it("allows fields with multiple matching arguments", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Repository" refkey={nodeRef}>
            <gql.FieldDefinition
              name="issues"
              type={
                <gql.TypeReference
                  type={
                    <gql.TypeReference
                      type={gql.builtInScalars.String}
                      required
                    />
                  }
                  list
                  required
                />
              }
              args={
                <>
                  <gql.InputValueDefinition
                    name="first"
                    type={<gql.TypeReference type={gql.builtInScalars.Int} />}
                  />
                  <gql.InputValueDefinition
                    name="after"
                    type={
                      <gql.TypeReference type={gql.builtInScalars.String} />
                    }
                  />
                </>
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="GitHubRepo" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="issues"
              type={
                <gql.TypeReference
                  type={
                    <gql.TypeReference
                      type={gql.builtInScalars.String}
                      required
                    />
                  }
                  list
                  required
                />
              }
              args={
                <>
                  <gql.InputValueDefinition
                    name="first"
                    type={<gql.TypeReference type={gql.builtInScalars.Int} />}
                  />
                  <gql.InputValueDefinition
                    name="after"
                    type={
                      <gql.TypeReference type={gql.builtInScalars.String} />
                    }
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
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition name="Named" refkey={namedRef}>
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition
            name="User"
            implements={[nodeRef, namedRef]}
          >
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toBeDefined();
    });

    it("throws when type is missing a field from one of multiple interfaces", () => {
      const nodeRef = refkey();
      const namedRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.InterfaceTypeDefinition name="Named" refkey={namedRef}>
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition
            name="User"
            implements={[nodeRef, namedRef]}
          >
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "User" does not correctly implement interface "Named".',
      );
    });
  });

  describe("TypeReference support", () => {
    it("validates matching types using TypeReference with refkeys", () => {
      const nodeRef = refkey();

      const { text, errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(text).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it("throws when TypeReference types don't match", () => {
      const nodeRef = refkey();

      const { errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="id"
              type={
                <gql.TypeReference type={gql.builtInScalars.String} required />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'Type "User" does not correctly implement interface "Node".',
      );
    });

    it("validates list types with TypeReference", () => {
      const nodeRef = refkey();

      const { text, errors } = toGraphQLTextWithErrors(
        <>
          <gql.InterfaceTypeDefinition name="Connection" refkey={nodeRef}>
            <gql.FieldDefinition
              name="nodes"
              type={
                <gql.TypeReference
                  type={
                    <gql.TypeReference
                      type={gql.builtInScalars.String}
                      required
                    />
                  }
                  list
                  required
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition
            name="UserConnection"
            implements={[nodeRef]}
          >
            <gql.FieldDefinition
              name="nodes"
              type={
                <gql.TypeReference
                  type={
                    <gql.TypeReference
                      type={gql.builtInScalars.String}
                      required
                    />
                  }
                  list
                  required
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(text).toBeDefined();
      expect(errors).toHaveLength(0);
    });

    it("validates argument types with TypeReference and custom types", () => {
      const nodeRef = refkey();
      const statusRef = refkey();

      const { text, errors } = toGraphQLTextWithErrors(
        <>
          <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
            <gql.EnumValue name="ACTIVE" />
            <gql.EnumValue name="INACTIVE" />
          </gql.EnumTypeDefinition>
          <gql.InterfaceTypeDefinition name="Filterable" refkey={nodeRef}>
            <gql.FieldDefinition
              name="items"
              type={<gql.TypeReference type={gql.builtInScalars.String} list />}
              args={
                <gql.InputValueDefinition
                  name="status"
                  type={<gql.TypeReference type={statusRef} required />}
                />
              }
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="UserList" implements={[nodeRef]}>
            <gql.FieldDefinition
              name="items"
              type={<gql.TypeReference type={gql.builtInScalars.String} list />}
              args={
                <gql.InputValueDefinition
                  name="status"
                  type={<gql.TypeReference type={statusRef} required />}
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(text).toBeDefined();
      expect(errors).toHaveLength(0);
    });
  });
});
