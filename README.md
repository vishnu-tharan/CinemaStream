# CinemaStream

Movie discovery and personal collections built with Expo 54, React Native, Expo Router, and Firebase.

## Features

- Responsive charcoal and amber design, custom icons and splash artwork.
- Search titles, cast, genres, and years; combine genre/decade filters and sorting.
- Favorites, watchlist, and watched collections, with legacy favorites preserved.
- Distributor trailer links where verified; labeled YouTube searches otherwise.
- Persistent sign-in, password recovery, email verification, resumable profile setup.
- Per-account device cache, durable offline changes, reconnect sync, and retries.
- Production web offline shell/catalog, cached posters, loading and error placeholders.
- Accessible labels, larger touch targets, crash boundary, optional Sentry reporting.

This app discovers movies and opens trailers; it does not stream full films.

## Run and validate

Copy `.env.example` to `.env.local` and fill in the six Firebase values from your own project settings before starting Expo. Keep `.env.local` out of Git. Set the same variables in production build settings; `EXPO_PUBLIC_` values are embedded in the client app and are not private secrets.

    npm install
    npm start
    npm run typecheck
    npm run lint
    npm run test:unit
    npm run export:web

The checked-in .npmrc uses legacy-peer-deps because Firebase's optional AsyncStorage peer range differs from Expo 54's supported version. Keep framework and native package versions compatible.

Host the entire generated dist directory over HTTPS, with static-route handling. Offline browsing requires an initial online visit. Remote trailers and uncached posters need connectivity. Firebase traffic is never included in the public service-worker cache. Device collection storage is not encrypted; signing out hides the previous account's cache.

## Firebase emulator tests

Install the official Firebase CLI and Java 21 or newer, then run:

    firebase emulators:start --only firestore,auth --project demo-cinemastream

In another terminal:

    npm run test:rules

For interactive tests, set EXPO_PUBLIC_USE_EMULATORS=1 in .env.local and restart Expo. This is development-only, uses a demo project, and connects to local Auth port 9099 and Firestore port 8086. Use test credentials.

Ten rule tests cover authentication, account isolation, schemas, server timestamps, legacy favorites, and denied unknown collections. Eight unit tests cover discovery filtering/sorting, migration, pending changes, and damaged cache restoration.

## Production setup

Firebase client configuration is read from environment variables in lib/firebase.ts. Profiles use users/{uid}; collection records use users/{uid}/library/{movieId}. Owner-only server rules are in firestore.rules. Legacy favorites remain readable; explicit new library records take precedence. IDs are limited to the current 14-film catalog, so update the rules and client validator together when adding films.

Local rules do not change the live database. Review other consumers of project YOUR_FIREBASE_PROJECT_ID before replacing live rules. From an authenticated Firebase CLI:

    firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID

See [the release checklist](RELEASE_CHECKLIST.md) for account configuration, monitoring, dependency advisories, and device testing.

## Validation recorded on 5 October 2026

TypeScript, ESLint, eight unit tests, ten emulator rule tests, production web export, and Android JavaScript export passed. The production recovery screen reloaded with the local web server stopped. Full native builds, Hermes compilation, live Firebase delivery, and physical devices remain release checks. No live Firebase configuration or GitHub remote was changed.


## Guest mode and performance

The login screen offers Continue as guest. Guests can browse/search/filter films,
read details, and open trailers. Collections and account screens show sign-in
prompts. Guest mode creates no Firebase account and performs no private collection
reads/writes. A device flag restores browsing after reload; signing in clears it.
Exit guest mode returns to login. Server database permissions remain owner-only.

The web entry bundle is approximately 2.67 MB, down from 4.25 MB; the optional
crash SDK is a separate approximately 1.60 MB chunk. This reduces initial execution,
not the total exported JavaScript. The offline worker may cache that chunk in the
background. Grid thumbnail bytes fell from 833,574 to 328,998 (61% reduction across 13 available posters),
while detail/hero screens retain the original artwork. Run
`node scripts/generate-thumbnails.cjs` to regenerate grid assets.

Movie cards avoid unnecessary redraws, list rendering uses bounded batches,
regular sign-in avoids duplicate profile repair, and identical collection cache
snapshots avoid repeated storage writes. All 14 film URLs have exported static
pages so direct links and reloads work. Actual startup time, frame rate, and memory
still require measurements on physical devices in a release build.
