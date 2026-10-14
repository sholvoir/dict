import type { IDictionary } from "@sholvoir/dict-server/src/lib/idict.ts";
import {
   getJson,
   getText,
   jsonInit,
   textInit,
   url,
} from "@sholvoir/generic/http";

const API_BASE = "/api/v2";

export const dict_get = (word: string, d?: string) =>
   getJson<IDictionary>(url(`${API_BASE}/dict`, { q: word, d }));

export const dict_patch = (dict: Partial<IDictionary>) =>
   fetch(`${API_BASE}/dict`, jsonInit(dict, "PUT"));

export const dict_delete = (word: string) =>
   fetch(url(`${API_BASE}/dict`, { q: word }), { method: "DELETE" });

export const ecdict_get = async () => fetch(`${API_BASE}/ecdict`);

export const issue_get = () =>
   getJson<Array<{ issue: string }>>(`${API_BASE}/issue`);

export const issue_delete = async (issue: string) =>
   fetch(url(`${API_BASE}/issue`, { issue }), { method: "DELETE" });

export const vocabulary_get = () =>
   getJson<{
      words: string[];
      checksum: string;
   }>(`${API_BASE}/vocabulary`);

export const vocabulary_post = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, textInit(words));

export const vocabulary_delete = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, textInit(words, "DELETE"));

export const version_get = () => getText(`${API_BASE}/version`);
