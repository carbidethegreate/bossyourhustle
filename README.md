# BossMyHustle OF Tool Box

A multi-module platform for managing OnlyFans accounts. Each module interacts
with the OnlyFans API and webhooks to help creators automate and monitor their
accounts.

## Project Overview
- Modular design; modules intertwine as the project grows.
- Front-end and back-end are equally important. User experience should always
  indicate background activity and surface clear error messages.
- Uses the OnlyFans API and OpenAPI.
- Initial setup includes a simple PHP login to prevent unauthorized access.

## Environment
- **Domain:** [bossyourhustle.com](http://bossyourhustle.com)
- **Server:** Plesk with Cloudflare tunnel and DNS.
- **Node.js:** 22.18.0
- **PHP:** 8.2.29 (FPM/FastCGI)
- **Database:** `byhdb_` on `localhost:3306` with user `carbide` (password
  managed outside the repo).

## Modules and Features
| Module | Description |
| ------ | ----------- |
| Authentication | Simple PHP login to restrict access. |

_Add new modules to this table as the project expands._

## Style
The UI color scheme should be black, white, and gray with rose highlights.

## OnlyFans API Resources
- Review the [Quickstart](https://onlyfansapi.com/introduction/quickstart) for API key creation and account connection.
- Understand the [Credit System](https://onlyfansapi.com/introduction/essentials/credits) and [Rate Limits](https://onlyfansapi.com/introduction/essentials/rate-limits).
- Learn the [Response Structure](https://onlyfansapi.com/introduction/essentials/response-structure) and [Proxies](https://onlyfansapi.com/introduction/essentials/proxies).
- See guides for [Composing Posts](https://onlyfansapi.com/introduction/guides/composing-posts), [Composing Messages](https://onlyfansapi.com/introduction/guides/composing-messages), [Uploading Media](https://onlyfansapi.com/introduction/guides/uploading-media), and [Text Formatting](https://onlyfansapi.com/introduction/guides/text-formatting).
- Always consult the official OnlyFansAPI.com documentation for up-to-date endpoints and usage details.

## Contributing
1. Keep documentation, including this README, up to date.
2. Run tests (`npm test`, `npm run lint`, `composer test`) when available.
3. Use clear, descriptive commit messages.
