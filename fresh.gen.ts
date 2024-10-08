// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_auth_middleware from "./routes/(auth)/_middleware.ts";
import * as $_auth_api_word_ from "./routes/(auth)/api/[word].ts";
import * as $_auth_api_middleware from "./routes/(auth)/api/_middleware.ts";
import * as $_auth_index from "./routes/(auth)/index.tsx";
import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $lookup from "./islands/lookup.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/(auth)/_middleware.ts": $_auth_middleware,
    "./routes/(auth)/api/[word].ts": $_auth_api_word_,
    "./routes/(auth)/api/_middleware.ts": $_auth_api_middleware,
    "./routes/(auth)/index.tsx": $_auth_index,
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
  },
  islands: {
    "./islands/lookup.tsx": $lookup,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
