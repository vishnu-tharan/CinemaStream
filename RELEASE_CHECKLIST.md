# Release checklist

## Completed locally

- Responsive redesign, custom icon, adaptive icon, favicon, and splash artwork.
- Discovery filters/sorting, trailer entry points, and three collection states.
- Password recovery, verification, and signup/profile recovery screens.
- Collection cache and durable pending sync queue, retry and loading UI.
- Offline production web shell/catalog and poster caching/error placeholders.
- Owner-only Firestore rules with schema and server timestamp validation.
- TypeScript, ESLint, eight unit tests, ten emulator security tests, production
  web export, and Android JavaScript export.

## Production configuration

- Deploy `firestore.rules` after reviewing any other apps using the Firebase
  project. Local rules do not protect the live database until deployed.
- Enable Email/Password sign-in, configure password policy and email enumeration
  protection, and review authorized domains and email action templates.
- Check live signup, profile recovery, verification delivery/refresh, reset-link
  delivery/completion, and access rules. Emulator success does not verify delivery.
- Review API key restrictions, usage limits, and billing alerts.
- Set a real `EXPO_PUBLIC_SENTRY_DSN` to activate release crash reporting.
  User/request/breadcrumb fields are omitted and common secrets in exception
  text are redacted. Verify privacy copy, a controlled crash, source-map upload,
  and native symbolication before relying on production reports. Keep upload
  tokens secret; do not put them in public environment variables or Git.

## Dependencies

The audit on 5 October 2026 reports **34 findings: 12 moderate, 22 high, zero
critical**. Compatible grpc-js and PostCSS overrides reduced the previous 39.
Remaining findings include transitive Expo/React Native dependencies; this app
is not claimed vulnerability-free. Review `npm audit` during a planned framework
upgrade and before releases. Avoid `npm audit fix --force`, whose suggestions
can replace Expo with an incompatible framework version.

## Device and browser checks

- Build release Android/iOS apps and verify icons, splash, cold-start sign-in,
  account switching, signup recovery, and rapid collection taps.
- Test airplane mode, offline edits, restart, reconnect, permission denial, and
  isolation between two users' cached collections.
- Check narrow screens, tablets, large text, screen readers, keyboard focus,
  and safe areas. Browser checks do not replace physical-device validation.
- Host web over HTTPS and verify worker updates, offline reload, and deep links.
- Full Hermes compilation could not be verified because execution of the compiler
  was denied in this workspace. Android JavaScript export passed.

## Trailer sources

Direct links in `lib/trailers.ts` were checked against distributor material:
Legendary (Interstellar), Paramount (Titanic), Sony (Spider-Man: No Way Home),
and Disney (Frozen II, The Lion King). Remaining films use explicitly labeled
search links. Availability and regional restrictions can change.
