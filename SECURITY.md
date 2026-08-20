# Security policy

## Reporting a vulnerability

Please do **not** open a public issue. Report privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, or contact the maintainers directly.

## What this client is, for the purpose of a report

This SDK is a thin HTTP client. It holds no permissions, stores no credentials,
and makes no access decisions. Every authorization check happens server-side in
[Xfeatures Athenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum),
resolved from that service's own database on every call.

That means a finding of the form "I edited a field in the SDK and got data I
should not have" is a **server** finding, and the more valuable place to report
it is the core repository. Nothing in this package can widen what a token is
allowed to see.

## In scope here

- **Credential handling**: anything that causes a token to be logged, persisted,
  sent to an unintended host, or attached to a request it was not meant for
- **Transport**: URL construction that could send a request somewhere other than
  the configured `baseUrl`, or that lets caller input alter the request path or
  method unexpectedly
- **Error handling**: anything that surfaces more of a response than the caller
  asked for, or that swallows a failure and returns a value as if it succeeded
- **Type accuracy**: a declared type that does not match what the server returns,
  where believing it would cause a caller to mishandle data

## Not in scope

- Server-side authorization, classification and retrieval behaviour — report
  those against the core repository
- The absence of a publish method. That is deliberate: no transport exposes one
