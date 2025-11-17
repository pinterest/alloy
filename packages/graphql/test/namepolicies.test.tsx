/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

it("correct formatting of type name", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDefinition name="a-really-WeirdType-name">
      <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
    </gql.ObjectTypeDefinition>,
  );
  const expected = d`
    type AReallyWeirdTypeName {
      id: ID!
    }
  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of field names", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDefinition name="User">
      <gql.FieldDefinition name="user-ID" type={code`${builtInScalars.ID}!`} />
      <gql.FieldDefinition name="FirstName" type={builtInScalars.String} />
      <gql.FieldDefinition name="last_name" type={builtInScalars.String} />
    </gql.ObjectTypeDefinition>,
  );
  const expected = d`
    type User {
      userId: ID!
      firstName: String
      lastName: String
    }
  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of argument names", () => {
  const userRef = refkey();

  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="User" refkey={userRef}>
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Query">
        <gql.FieldDefinition
          name="user"
          type={userRef}
          args={
            <>
              <gql.InputValueDefinition
                name="user-ID"
                type={code`${builtInScalars.ID}!`}
              />
              <gql.InputValueDefinition
                name="FirstName"
                type={builtInScalars.String}
              />
              <gql.InputValueDefinition
                name="include_deleted"
                type={builtInScalars.Boolean}
              />
            </>
          }
        />
      </gql.ObjectTypeDefinition>
    </>,
  );
  expect(result).toRenderTo(d`
    type User {
      id: ID
    }
    
    type Query {
      user(userId: ID!, firstName: String, includeDeleted: Boolean): User
    }
  `);
});

it("correct formatting of directive names", () => {
  const result = toGraphQLText(
    <gql.DirectiveDefinition
      name="custom-Auth-Directive"
      locations={["FIELD_DEFINITION"]}
      args={<gql.InputValueDefinition name="required-Role" type="Role!" />}
    />,
  );
  expect(result).toBe(
    "directive @customAuthDirective(requiredRole: Role!) on FIELD_DEFINITION",
  );
});

it("appends _ to lowercase operation keywords (query, mutation, subscription)", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="query">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="mutation">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="subscription">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>
    </>,
  );
  const expected = d`
    type Query_ {
      id: ID!
    }

    type Mutation_ {
      id: ID!
    }

    type Subscription_ {
      id: ID!
    }
  `;
  expect(result).toRenderTo(expected);
});

it("allows PascalCase operation type names (Query, Mutation, Subscription)", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="Query">
        <gql.FieldDefinition name="hello" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Mutation">
        <gql.FieldDefinition name="update" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Subscription">
        <gql.FieldDefinition name="onChange" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>
    </>,
  );
  const expected = d`
    type Query {
      hello: String
    }

    type Mutation {
      update: Boolean
    }

    type Subscription {
      onChange: String
    }
  `;
  expect(result).toRenderTo(expected);
});

it("appends _ to reserved words in field names", () => {
  const result = toGraphQLText(
    <gql.ObjectTypeDefinition name="User">
      <gql.FieldDefinition name="type" type={builtInScalars.String} />
      <gql.FieldDefinition name="on" type={builtInScalars.String} />
      <gql.FieldDefinition name="null" type={builtInScalars.String} />
    </gql.ObjectTypeDefinition>,
  );
  const expected = d`
    type User {
      type_: String
      on_: String
      null_: String
    }
  `;
  expect(result).toRenderTo(expected);
});

it("appends _ to reserved words in argument names", () => {
  const userRef = refkey();

  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="User" refkey={userRef}>
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Query">
        <gql.FieldDefinition
          name="user"
          type={userRef}
          args={
            <>
              <gql.InputValueDefinition
                name="fragment"
                type={builtInScalars.String}
              />
              <gql.InputValueDefinition
                name="mutation"
                type={builtInScalars.Boolean}
              />
            </>
          }
        />
      </gql.ObjectTypeDefinition>
    </>,
  );
  expect(result).toRenderTo(d`
    type User {
      id: ID
    }
    
    type Query {
      user(fragment_: String, mutation_: Boolean): User
    }
  `);
});

it("appends _ to all built-in scalar names (Int, Float, String, Boolean), except ID", () => {
  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="Int">
        <gql.FieldDefinition name="value" type={builtInScalars.Int} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Float">
        <gql.FieldDefinition name="value" type={builtInScalars.Float} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="String">
        <gql.FieldDefinition name="value" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="Boolean">
        <gql.FieldDefinition name="value" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="ID">
        <gql.FieldDefinition name="value" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>
    </>,
  );
  // ID won't get _ because it doesn't remain conflicting after transformation
  const expected = d`
    type Int_ {
      value: Int
    }

    type Float_ {
      value: Float
    }

    type String_ {
      value: String
    }

    type Boolean_ {
      value: Boolean
    }

    type Id {
      value: ID
    }
  `;
  expect(result).toRenderTo(expected);
});

it("does not append _ to built-in scalars when used as field types", () => {
  // Built-in scalars should only get _ when used as TYPE NAMES, not as field types
  const result = toGraphQLText(
    <gql.ObjectTypeDefinition name="User">
      <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      <gql.FieldDefinition name="name" type={builtInScalars.String} />
      <gql.FieldDefinition name="age" type={builtInScalars.Int} />
      <gql.FieldDefinition name="score" type={builtInScalars.Float} />
      <gql.FieldDefinition name="active" type={builtInScalars.Boolean} />
    </gql.ObjectTypeDefinition>,
  );
  const expected = d`
    type User {
      id: ID
      name: String
      age: Int
      score: Float
      active: Boolean
    }
  `;
  expect(result).toRenderTo(expected);
});

it("applies name policy to refkeys", () => {
  const userRef = refkey();
  const postRef = refkey();

  const result = toGraphQLText(
    <>
      <gql.ObjectTypeDefinition name="user-type" refkey={userRef}>
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition name="posts" type={code`[${postRef}!]!`} />
      </gql.ObjectTypeDefinition>
      <gql.ObjectTypeDefinition name="post-type" refkey={postRef}>
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        <gql.FieldDefinition name="author" type={userRef} />
      </gql.ObjectTypeDefinition>
    </>,
  );
  const expected = d`
    type UserType {
      id: ID!
      posts: [PostType!]!
    }

    type PostType {
      id: ID!
      author: UserType
    }
  `;
  expect(result).toRenderTo(expected);
});

describe("GraphQL name format validation", () => {
  it("throws error when name starts with a digit", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="123User">
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(/Invalid GraphQL name "123User".*cannot start with a digit/);
  });

  it("throws error when field name starts with a digit", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="1stName" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(/Invalid GraphQL name "1stName".*cannot start with a digit/);
  });

  it("throws error when argument name starts with a digit", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition
            name="field"
            type={builtInScalars.String}
            args={
              <gql.InputValueDefinition
                name="1stArg"
                type={builtInScalars.String}
              />
            }
          />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(/Invalid GraphQL name "1stArg".*cannot start with a digit/);
  });

  it("allows names with hyphens (gets transformed by pascalCase)", () => {
    // pascalCase removes hyphens, so "User-Type" becomes "UserType"
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User-Type">
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type UserType {
        id: ID
      }
    `);
  });

  it("allows names with special chars (gets transformed by pascalCase)", () => {
    // pascalCase removes special chars, so "User$Type" becomes "UserType"
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User$Type">
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type UserType {
        id: ID
      }
    `);
  });

  it("preserves single leading underscore", () => {
    // Single underscore is valid per GraphQL spec and should be preserved
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="_User">
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    // Single leading underscore is now preserved
    expect(result).toRenderTo(d`
      type _User {
        id: ID
      }
    `);
  });

  it("transforms snake_case to PascalCase (removes underscores)", () => {
    // Following GraphQL conventions: types use PascalCase without underscores
    // user_type → UserType
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="user_type">
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type UserType {
        id: ID
      }
    `);
  });

  it("transforms field names with underscores to camelCase", () => {
    // Following GraphQL conventions: fields use camelCase without underscores
    // first_name → firstName
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition name="first_name" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User {
        firstName: String
      }
    `);
  });

  it("allows names with digits after the first character", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User123">
        <gql.FieldDefinition name="id" type={builtInScalars.ID} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User123 {
        id: ID
      }
    `);
  });

  it("allows names with mixed case and digits", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="MyType2024">
        <gql.FieldDefinition name="field1" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type MyType2024 {
        field1: String
      }
    `);
  });

  it("validates directive names for invalid format", () => {
    expect(() => {
      toGraphQLText(
        <gql.DirectiveDefinition
          name="123invalid"
          locations={["FIELD_DEFINITION"]}
        />,
      );
    }).toThrow(/Invalid GraphQL name "123invalid".*cannot start with a digit/);
  });

  it("preserves single leading underscore in field names", () => {
    // Single leading underscore is preserved, but rest follows camelCase convention
    // _internal_field → _internalField (underscore in middle is removed)
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition
          name="_internal_field"
          type={builtInScalars.String}
        />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User {
        _internalField: String
      }
    `);
  });

  it("throws error for names starting with double underscore (reserved for introspection)", () => {
    // Names starting with __ are reserved per GraphQL spec
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="__CustomType">
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(
      /Invalid GraphQL name "__CustomType".*reserved for GraphQL introspection system/,
    );
  });

  it("throws error for field names starting with double underscore", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="__typename" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(
      /Invalid GraphQL name "__typename".*reserved for GraphQL introspection system/,
    );
  });

  it("throws error for directive names starting with double underscore", () => {
    expect(() => {
      toGraphQLText(
        <gql.DirectiveDefinition
          name="__internal"
          locations={["FIELD_DEFINITION"]}
        />,
      );
    }).toThrow(
      /Invalid GraphQL name "__internal".*reserved for GraphQL introspection system/,
    );
  });
});
