# Xfeatures Athenaeum SDK

**Typed TypeScript client for [Xfeatures Athenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum).**

[![CI](https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK/actions/workflows/ci.yml/badge.svg)](https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](packages/athenaeum-types)
[![Dependencies](https://img.shields.io/badge/runtime_deps-none-brightgreen)](packages/athenaeum-sdk/package.json)
[![Licence](https://img.shields.io/badge/licence-proprietary-lightgrey)](LICENSE)

## Your first authenticated request

```ts
import { AthenaeumClient } from "@xfeatures/athenaeum-sdk";

// 1. Get a token from Xfeatures Account (service application, client_credentials).
const auth = await fetch("https://auth.xfeatures.net/oauth/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.ATHENAEUM_CLIENT_ID!,
    client_secret: process.env.ATHENAEUM_CLIENT_SECRET!
  })
});
const { access_token } = await auth.json();

// 2. Use it.
const athenaeum = new AthenaeumClient({
  baseUrl: "https://athenaeum.xfeatures.net",
  token: access_token
});

const { results } = await athenaeum.search({ query: "refund window", domain: "support", limit: 5 });
for (const hit of results) {
  console.log(hit.title, hit.score, hit.content);
}
```

That is the whole setup. No build step required beyond your own, no runtime
dependencies, and nothing to configure globally.

## Install

Not published to npm. Consume it from this repository:

```bash
npm install github:XfeaturesGroup/XfeaturesAthenaeumSDK#main --workspace-root
```

For local development against a checkout, use a `file:` reference:

```jsonc
{ "dependencies": { "@xfeatures/athenaeum-sdk": "file:../XfeaturesAthenaeumSDK/packages/athenaeum-sdk" } }
```

## What is in here

| Package | What it is |
|---|---|
| [`@xfeatures/athenaeum-types`](packages/athenaeum-types) | Hand-authored TypeScript types for the REST surface. No runtime code. |
| [`@xfeatures/athenaeum-sdk`](packages/athenaeum-sdk) | A thin `fetch` client built on those types. No dependencies beyond the platform `fetch`. |

They live together because the SDK is the only consumer of the types, and
splitting them across repositories would buy a second release train and nothing
else.

## The client

```ts
new AthenaeumClient({ baseUrl, token, fetch? })
```

| Method | Returns |
|---|---|
| `search(body)` | Evidence chunks with citations, or `NO_RELIABLE_MATCH` |
| `getFact(namespace, key)` | One exact fact |
| `listFacts(namespace, { limit, offset })` | Facts in a namespace |
| `getDocument(idOrSlug, { includeContent })` | Document metadata, optionally with full text |
| `getProduct(code)` / `getPlan(code)` / `getPolicy(code)` | Catalog lookups |
| `submitFeedback(body)` | Report that an answer was wrong or stale |
| `proposeDocument(input)` | Create a **draft** — never publishes |
| `submitDocumentForReview(documentId)` | Hand a draft to a human reviewer |

`fetch` is injectable, which is how the tests run without a network.

## Errors

Failures throw `AthenaeumApiError`, carrying the server's stable `code`, its
message, the HTTP status and the `request_id` to quote in a bug report.

```ts
import { AthenaeumApiError } from "@xfeatures/athenaeum-sdk";

try {
  await athenaeum.getDocument("handbook");
} catch (error) {
  if (error instanceof AthenaeumApiError && error.code === "NOT_FOUND") {
    // The document does not exist, OR this token may not read it.
    // Athenaeum deliberately does not distinguish the two: a FORBIDDEN would
    // confirm that a document you are not cleared for exists.
  }
}
```

## What this client does not do

It holds no permissions of its own and makes no access decisions. Every
authorization check happens server-side in Athenaeum, resolved from that
service's own database on every call. Editing anything here — a field, a filter,
a classification — changes what you *ask for*, never what you may receive.

There is no publish method, because no transport exposes one.

## Related repositories

| | |
|---|---|
| [XfeaturesAthenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum) | The core service: Worker, REST implementation, OpenAPI, storage, security |
| [XfeaturesAthenaeumMCP](https://github.com/XfeaturesGroup/XfeaturesAthenaeumMCP) | Connecting an MCP client |
| [XfeaturesAthenaeumCLI](https://github.com/XfeaturesGroup/XfeaturesAthenaeumCLI) | The `athenaeum` command-line client, built on this SDK |

## Development

```bash
cd packages/athenaeum-types && npm install && npm run build
cd ../athenaeum-sdk        && npm install && npm run build && npm test
```

Build order matters: the SDK depends on the types via a `file:` reference.

## Licence

Source-available for reading, not open source. See [LICENSE](LICENSE).
