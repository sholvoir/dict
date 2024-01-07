// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_word_ from "./routes/api/[word].ts";
import * as $api_middleware from "./routes/api/_middleware.ts";
import * as $index from "./routes/index.tsx";
import * as $Lookup from "./islands/Lookup.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/[word].ts": $api_word_,
    "./routes/api/_middleware.ts": $api_middleware,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/Lookup.tsx": $Lookup,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
