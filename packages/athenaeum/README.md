# @xfeaturesgroup/athenaeum

**Typed TypeScript client for [Xfeatures Athenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum)** — a secure knowledge and retrieval service for AI agents, built on Cloudflare Workers, D1, R2 and AI Search.

[![npm](https://img.shields.io/npm/v/@xfeaturesgroup/athenaeum)](https://www.npmjs.com/package/@xfeaturesgroup/athenaeum)
[![Licence](https://img.shields.io/badge/licence-proprietary-lightgrey)](LICENSE)

## Install

```bash
npm install @xfeaturesgroup/athenaeum
```

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

No runtime dependencies beyond the platform `fetch`. No build step required beyond your own.

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

`fetch` is injectable, which is how the package's own tests run without a network.

## Types

Every request and response shape is exported: `Classification`, `FactDTO`, `DocumentDTO`, `DocumentContentDTO`, `ProductDTO`, `PlanDTO`, `PolicyDTO`, `SearchResultDTO`, `SearchRequest`, `SearchResponse`, `FeedbackRequest`, `ProposeDocumentRequest`, `ApiErrorPayload`, and the response envelopes (`FactResponse`, `FactsListResponse`, `DocumentResponse`, `ProductResponse`, `PlanResponse`, `PolicyResponse`, `DocumentDraftResponse`, `SubmitForReviewResponse`).

```ts
import type { DocumentDTO, Classification } from "@xfeaturesgroup/athenaeum";
```

## Errors

Failures throw `AthenaeumApiError`, carrying the server's stable `code`, its message, the HTTP status and the `request_id` to quote in a bug report.

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

It holds no permissions of its own and makes no access decisions. Every authorization check happens server-side in Athenaeum, resolved from that service's own database on every call. Editing anything here — a field, a filter, a classification — changes what you *ask for*, never what you may receive.

There is no publish method, because no transport exposes one.

## Related

| | |
|---|---|
| [XfeaturesAthenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum) | The core service |
| [XfeaturesAthenaeumMCP](https://github.com/XfeaturesGroup/XfeaturesAthenaeumMCP) | Connecting an MCP client instead |
| [@xfeaturesgroup/athenaeum-cli](https://www.npmjs.com/package/@xfeaturesgroup/athenaeum-cli) | Terminal client, built on this package |

## Licence

**Source available — proprietary software, not open source.** Licensed under the [Xfeatures Client Software License](LICENSE), which permits using this package, unmodified, to consume Xfeatures Services — including commercially. See [LICENSE](LICENSE) for full terms.
