# Xfeatures Athenaeum SDK

**Typed TypeScript client for [Xfeatures Athenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum).**

[![CI](https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK/actions/workflows/ci.yml/badge.svg)](https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@xfeaturesgroup/athenaeum)](https://www.npmjs.com/package/@xfeaturesgroup/athenaeum)
[![Dependencies](https://img.shields.io/badge/runtime_deps-none-brightgreen)](packages/athenaeum/package.json)
[![Licence](https://img.shields.io/badge/licence-proprietary-lightgrey)](LICENSE)

## Your first authenticated request

```ts
import { AthenaeumClient } from "@xfeaturesgroup/athenaeum";

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

```bash
npm install @xfeaturesgroup/athenaeum
```

For local development against a checkout instead, use a `file:` reference:

```jsonc
{ "dependencies": { "@xfeaturesgroup/athenaeum": "file:../XfeaturesAthenaeumSDK/packages/athenaeum" } }
```

## What is in here

One package: [`packages/athenaeum`](packages/athenaeum) — types and the REST
client together. The client is the only real consumer of the types, and a
two-package split bought nothing but a second version number to keep in sync,
so this repository publishes a single `@xfeaturesgroup/athenaeum`.

## The client

```ts
new AthenaeumClient({ baseUrl, token, fetch? })
```

| Method | Returns |
|---|---|
| `search(body)` | Facts and document passages together, each labelled by `type`, or `NO_RELIABLE_MATCH`. `include` narrows it to one half |
| `listFactNamespaces()` | The fact namespaces this caller can read, with counts |
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
import { AthenaeumApiError } from "@xfeaturesgroup/athenaeum";

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
cd packages/athenaeum && npm install && npm run build && npm test
```

## Releasing

Publishing happens only from a pushed `v0.x.y` tag, via
[`.github/workflows/publish.yml`](.github/workflows/publish.yml) — never on an
ordinary push to `main`. That workflow runs every gate (typecheck, test, build,
audit, tarball-content verification) non-interactively, then waits for a human
approval in the `npm-publish` GitHub environment before the package actually
reaches the registry. Publishing uses npm Trusted Publishing (OIDC): no
`NPM_TOKEN` is stored in this repository at any point, and the published
package carries npm's provenance attestation back to the exact workflow run
that built it.

## Licence

**Source available — proprietary software, not open source.**

Licensed under the [Xfeatures Client Software License](LICENSE) — not MIT,
Apache, GPL or any OSI-approved license. Unlike the core platform's license,
this one is written so you can actually *use* the official, unmodified client
to talk to Xfeatures Services, including commercially, as part of your own
product or internal system. What it does not permit, without written
permission: repackaging or redistributing a modified copy, reselling the
client itself, white-labelling it, or using its code to build a competing
client. Full terms in [LICENSE](LICENSE).
