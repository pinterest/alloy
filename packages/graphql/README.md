# @alloy-js/graphql

GraphQL schema building for Alloy. Define schemas with JSX components or the
string-template (`stc`) helpers, then compile to a `GraphQLSchema` from
`graphql-js`.

## Quick start

```tsx
import {
  Field,
  ObjectType,
  Query,
  String,
  renderSchema,
} from "@alloy-js/graphql";

const schema = renderSchema(
  <>
    <ObjectType name="Widget">
      <Field name="id" type={String} />
    </ObjectType>
    <Query>
      <Field name="widget" type="Widget" />
    </Query>
  </>,
);
```

`renderSchema` returns a `GraphQLSchema`. It runs `graphql-js` schema validation
by default; pass `{ validate: false }` to skip validation.

## Name policies

The package applies a default naming policy that enforces GraphQL conventions:
PascalCase types, lowerCamel fields/arguments, SCREAMING_SNAKE enum values.
GraphQL hard naming requirements (the spec name regex, `__` reserved prefix,
and enum value reserved words) are always enforced even when the policy is
turned off.

```ts
import { renderSchema, relayNamePolicy } from "@alloy-js/graphql";

renderSchema(<Schema>{/* ... */}</Schema>, { namePolicy: relayNamePolicy });
```

Choosing a policy affects both normalization and validation:

- Default (`namePolicy` omitted): enforces naming conventions only.
- Relay (`namePolicy: relayNamePolicy`): enforces naming conventions plus
  Relay-specific schema rules (connection shapes, pagination args, single
  `input` mutation argument).
- Disabled (`namePolicy: null`): no naming conventions are enforced, but
  GraphQL hard requirements still apply.

Use `createGraphQLNamePolicy` to customize formatting or regex rules. Formatters
run before rule validation.

```ts
import { createGraphQLNamePolicy, renderSchema } from "@alloy-js/graphql";

const policy = createGraphQLNamePolicy({
  format: { field: (name) => name.replace(/_/g, "") },
  rules: { field: /^[a-z][A-Za-z0-9]*$/ },
});

renderSchema(<Schema>{/* ... */}</Schema>, { namePolicy: policy });
```

## Relay connections

The JSX API includes Relay-friendly helpers like `Field.Connection`,
`Connection.Edge`, and `Connection.PageInfo`. Relay-specific validation (connection
shape, pagination arguments, single `input` mutation argument) is only enforced
when `relayNamePolicy` is selected.

## Built-ins and refkeys

Built-in scalar refkeys and Relay types (`Node`, `PageInfo`) live under
`src/builtins/`. These are exported so you can reference them by refkey or reuse
canonical type names without re-declaring them.

## Project layout

- `src/components/`: JSX API surface
- `src/schema/`: state, definitions, and schema build/validation
- `src/builtins/`: refkeys and built-in types
- `src/components/stc/`: string-template helpers (`@alloy-js/graphql/stc`)

## Binder model

Most Alloy language packages rely on the core binder model (symbols, scopes,
and refkey resolution) because they emit source code with imports and
cross-file references. The GraphQL package does not use the binder because
GraphQL schemas are a single, name-based graph with no import system and a
natural two-phase flow (collect definitions, then build/validate). A dedicated
schema state plus build-time validation maps more directly to the GraphQL
specification and keeps the API focused on schema semantics rather than symbol
resolution.

## Development

From the repo root:

```bash
pnpm -C packages/graphql test
pnpm -C packages/graphql generate-docs
```

The `generate-docs` script runs API Extractor for documentation metadata.
