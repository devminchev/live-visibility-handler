# Live Visibility Handler App

## Overview
Live Visibility Handler is a custom Contentful app whose primary job is to give editors a safe switch for hiding or showing `siteGameV2` entries on production (“live”) environments. The project bundles a minimal React configuration screen and a pair of Contentful App Action functions that update the `liveHidden` field on targeted entries, so editors can control visibility without touching raw data structures.

## Tech Stack
- **Framework & Tooling:** React 18 with Vite, TypeScript, Vitest for unit testing
- **Contentful SDKs:** `@contentful/app-sdk`, `@contentful/react-apps-toolkit`, Forma 36 UI components
- **Serverless Functions:** Contentful App Action functions written with `@contentful/node-apps-toolkit` and the `contentful-management` client

## How the project works
1. **Frontend app:** The UI renders inside Contentful’s App configuration location. It is powered by React and Forma 36 components, and is bootstrapped via `SDKProvider` so it can read/write installation parameters and respond to the host environment.
2. **App Action functions:** Two serverless handlers live under `functions/`:
   - `enableLiveHiddenActionHandler` sets `liveHidden` to `true` for the requested entries.
   - `disableLiveHiddenActionHandler` sets `liveHidden` to `false` for the requested entries.

   Both functions receive an App Action payload with `entryIds`, fetch the matching `siteGameV2` entries via the Contentful Management API, mutate the `liveHidden` field in the default locale, and persist the updates.
3. **Manifest & actions:** `contentful-app-manifest.json` wires the app actions (`hideOnLive` and `showOnLive`) to those functions, so they can be invoked from entry actions or other workflows inside Contentful.

## Project architecture
```
workspace/
├── src/                      # React app served inside Contentful
│   ├── App.tsx               # Location resolver, currently only config screen
│   ├── components/           # Shared UI pieces (e.g., localhost warning)
│   ├── locations/            # Location-specific screens (ConfigScreen)
│   └── index.tsx             # Entry point, SDKProvider bootstrap
├── functions/                # App Action serverless handlers
│   ├── enableLiveHiddenActionHandler.ts
│   └── disableLiveHiddenActionHandler.ts
├── contentful-app-manifest.json  # Declares app actions and function bundles
├── package.json              # Scripts for dev server, build, upload, actions
└── yarn.lock / node_modules  # Dependencies
```

## Installation
1. **Prerequisites**
   - Node.js 18+
   - Yarn or npm
   - Access to a Contentful organization where you can create custom apps and App Actions
2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

## Local development
```bash
yarn dev
# or
npm run dev
```
- Starts the Vite dev server (default port 5173).
- When opened outside the Contentful web app, the UI shows a warning screen because Contentful features require the host environment.
- To test inside Contentful, use `contentful-app-scripts create-app-definition` and `add-locations` (already wired via package.json) to register the app and point the location URL to your dev server.

## Building & deploying
```bash
yarn build
```
- Runs `vite build` for the frontend and compiles the functions via `build:functions`.
- Outputs a production-ready bundle under `dist/` (frontend) and `functions/*.js`.

Upload the bundle and function code to Contentful:
```bash
yarn upload
```
For CI usage, set `CONTENTFUL_ORG_ID`, `CONTENTFUL_APP_DEF_ID`, and `CONTENTFUL_ACCESS_TOKEN`, then run `yarn upload-ci` or `yarn upsert-actions-ci` to register/update the App Actions programmatically.

## Usage inside Contentful
1. Install the app into a space/environment via the Contentful web app.
2. Open any `siteGameV2` entry. In the actions menu you’ll see:
   - **Hide SiteGame On Live** (`hideOnLive`): calls `enableLiveHiddenActionHandler` to set `liveHidden` to `true`.
   - **Show SiteGame On Live** (`showOnLive`): calls `disableLiveHiddenActionHandler` to set `liveHidden` to `false`.
3. Each action expects an `entryIds` payload; when invoked from entry actions Contentful passes the current entry ID automatically.

## Testing
Run unit tests (Vitest + React Testing Library):
```bash
yarn test
```

## Contributing
1. Fork or clone the repository.
2. Create a feature branch and implement your changes.
3. Run `yarn test` and `yarn build` to ensure quality.
4. Open a pull request describing the change and any Contentful configuration updates (new actions, permissions, etc.).

## Additional resources
- [Contentful App Framework docs](https://www.contentful.com/developers/docs/extensibility/app-framework/)
- [Working with App Action functions](https://www.contentful.com/developers/docs/extensibility/app-framework/working-with-functions/)
- [Forma 36 design system](https://f36.contentful.com/)
