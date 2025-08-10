# BossMyHustle OF Tool Box

A multi-module platform for managing OnlyFans accounts. Each module interacts
with the OnlyFans API and webhooks to help creators automate and monitor their
accounts.

## Project Overview
- Modular design; modules intertwine as the project grows.
- Front-end and back-end are equally important. User experience should always
  indicate background activity and surface clear error messages.
- Uses the OnlyFans API and OpenAPI.
- Initial setup includes a simple Node.js login to prevent unauthorized access.

## OnlyFans API Reference
See [ONLYFANS_API.md](ONLYFANS_API.md) for a summary of how this project uses
OnlyFansAPI.com. **Always verify endpoint details with the official
OnlyFansAPI.com documentation before implementing calls.**

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
| Authentication | Node.js signup/login with SQLite and admin seeding. |

_Add new modules to this table as the project expands._

## Style
The UI color scheme should be black, white, and gray with rose highlights.

## Contributing
1. Keep documentation, including this README, up to date.
2. Run tests (`npm test`, `npm run lint`, `composer test`) when available.
3. Use clear, descriptive commit messages.
