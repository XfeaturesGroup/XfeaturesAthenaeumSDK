# Examples

- [`search-with-service-token.ts`](search-with-service-token.ts) — obtain a
  machine token from Xfeatures Account with the `client_credentials` grant, then
  search with the SDK. Shows token caching and error handling.

For an interactive sign-in instead of a service credential, see the
[CLI](https://github.com/XfeaturesGroup/XfeaturesAthenaeumCLI), which performs
the Authorization Code + PKCE flow.

Neither example contains credentials; both read them from the environment.
