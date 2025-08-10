# OnlyFans API Usage Guide

This repository interfaces with [OnlyFansAPI.com](https://onlyfansapi.com). The following notes
summarize key concepts when working with the API.

> **Always verify details against the official OnlyFansAPI.com documentation.** The platform
> evolves quickly and their docs are the source of truth.

## Getting Started
- Create an API key in the [OnlyFansAPI Console](https://app.onlyfansapi.com/api-keys).
- Connect your OnlyFans account via the automated login flow or by submitting a cURL request.
- Review the response format, rate limits, and credit system before making requests.

## Credits and Caching
- Most uncached requests consume **1 credit**; public endpoints may be cached and cost 0 credits.
- Media upload and scraping cost **6 credits per MB**.
- Append `?fresh=true` to force a non‑cached response.

## Rate Limits
- Basic plan: 1,000 requests/minute.
- Pro plan: 5,000 requests/minute.
- Enterprise: unlimited.
- Track limit headers in every response and implement backoff on HTTP 429.

## Webhooks
- Available on Pro and Enterprise plans.
- Subscribe through the console to receive events like `messages.received` or `subscriptions.new`.
- Verify payloads using the HMAC SHA256 signature when a signing secret is set.

## Media and Posts
- Upload media to `/media/upload` and use the returned `ofapi_media_*` ID once.
- Compose posts or messages by referencing uploaded media and optional pricing information.

## Proxy Infrastructure
- Each connected account gets an auto‑managed mobile proxy.
- Custom proxies must use dedicated residential or mobile IPs.

Refer to the official docs for endpoint specifics, payload structures, and up‑to‑date examples.
