# CinemaStream

A movie discovery and personal collection app built with JavaScript, React Native, Expo Router and Firebase.

![CinemaStream movie grid](docs/screenshots/movies.jpg)

[View screenshots](docs/screenshots/README.md)

## Features

- Browse 20 movies with clear posters and film details.
- Search titles, cast, genres and release years.
- Filter movies by genre and open official YouTube trailers.
- Sign up, sign in, reset a password and verify an email address.
- Browse as a guest without creating an account.
- Save favorites, keep a watchlist and mark movies as watched.

Internet access is required for account actions and saving or loading collections. Each account can access only its own collection. The app opens trailers; it does not stream full films.

## Project structure

| Folder            | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `app/`            | Screens and navigation.                                |
| `src/components/` | Shared buttons, forms, movie cards and poster display. |
| `src/contexts/`   | Sign-in state and collection operations.               |
| `src/lib/`        | Firebase setup, movie filtering and record validation. |
| `src/constants/`  | Shared colors.                                         |
| `assets/`         | Movie data, artwork and thumbnails.                    |
| `scripts/`        | Catalog checks and thumbnail generation.               |
| `tests/`          | Unit tests and database permission tests.              |
| `docs/`           | App screenshots.                                       |

A screen calls a context function to change a movie's collection record. The function validates the record, writes it to Firestore and updates the displayed collection after the write succeeds. Firebase Authentication identifies the signed-in account. Firestore rules check account ownership and the shape of each write.

## Run

Install Node.js 22.13 or a supported newer LTS version, copy `.env.example` to `.env.local`, and enter your Firebase project's client configuration. Enable Email/Password sign-in in Firebase Authentication and deploy `firestore.rules` to your own project before saving collections.

    npm install
    npm run web

Use `npm run android` or `npm run ios` with the appropriate development tools for native apps.

Never commit `.env.local` or private credentials. Firebase `EXPO_PUBLIC_` configuration is included in the app bundle; database rules protect account data.

## Check

    npm run lint
    npm run test:unit
    npm run test:catalog
    npm run format:check
    npm run export:web

The export command creates `dist/`, which can be hosted as a static website with clean route support. `node_modules/`, `.expo/` and `dist/` are generated folders, excluded from Git. Unit tests run directly against the JavaScript helpers.

Database permission tests need the Firebase CLI and Java 21 or newer:

    firebase emulators:start --only firestore,auth --project demo-cinemastream

Then run `npm run test:rules` in another terminal. Development builds can connect to these emulators with `EXPO_PUBLIC_USE_EMULATORS=1`.

Code formatting uses `npm run format`.

Movie posters and trailer footage belong to their respective rights holders. Source references are recorded in `assets/data/`.
