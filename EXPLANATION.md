# Explanation

**What was the bug?**
The `HttpClient.request` method looked at `this.oauth2Token` using a truthiness check and an `instanceof OAuth2Token` test before refreshing. When someone manually set `oauth2Token` to a plain object (e.g. a deserialized token), the `instanceof` check failed and the logic skipped both the refresh step and the header assignment. As a result API calls either sent no `Authorization` header or kept a stale token.

**Why did it happen?**
The condition was written as:

```ts
if (!this.oauth2Token ||
    (this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired)) {
  this.refreshOAuth2();
}
```

A plain object is truthy but not an `OAuth2Token`, so the whole expression evaluated to `false`. The second `if` that adds the header also relied on `instanceof`, so the header was never set.

**Why does your fix actually solve it?**
The revised check treats any non-`OAuth2Token` value as invalid and triggers a refresh. After the guard runs we guarantee `this.oauth2Token` is an `OAuth2Token` (either the previously valid one or a newly refreshed one), so the subsequent header assignment behaves correctly. This minimal change addresses the failing test without touching unrelated code.

**What’s one realistic case / edge case your tests still don’t cover?**
We don’t currently verify behaviour when a plain object token *looks* valid (has a future `expiresAt`). The current logic will also refresh in that scenario; a diverging design might choose to accept such objects. A test for this case would clarify the intended contract.
