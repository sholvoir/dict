// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_cors_user_middleware from "./routes/(cors)/(user)/_middleware.ts";
import * as $_cors_user_api_middleware from "./routes/(cors)/(user)/api/_middleware.ts";
import * as $_cors_user_api_word from "./routes/(cors)/(user)/api/word.ts";
import * as $_cors_user_index from "./routes/(cors)/(user)/index.tsx";
import * as $_cors_middleware from "./routes/(cors)/_middleware.ts";
import * as $_cors_pub_sound from "./routes/(cors)/pub/sound.ts";
import * as $_cors_pub_word from "./routes/(cors)/pub/word.ts";
import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $lookup from "./islands/lookup.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/(cors)/(user)/_middleware.ts": $_cors_user_middleware,
    "./routes/(cors)/(user)/api/_middleware.ts": $_cors_user_api_middleware,
    "./routes/(cors)/(user)/api/word.ts": $_cors_user_api_word,
    "./routes/(cors)/(user)/index.tsx": $_cors_user_index,
    "./routes/(cors)/_middleware.ts": $_cors_middleware,
    "./routes/(cors)/pub/sound.ts": $_cors_pub_sound,
    "./routes/(cors)/pub/word.ts": $_cors_pub_word,
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
  },
  islands: {
    "./islands/lookup.tsx": $lookup,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
