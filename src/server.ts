import type { IDictionary } from "@sholvoir/dict-server/src/lib/idictionary.ts";
import {
   getJson,
   getText,
   jsonInit,
   textInit,
   url,
} from "@sholvoir/generic/http";
import type { IIssue } from "./iissue.ts";

const API_BASE = "/api/v2";

export const dict_get = (word: string, d?: string) =>
   getJson<Partial<IDictionary>>(
      url(`${API_BASE}/dict/${encodeURIComponent(word)}`, { d }),
   );

export const dict_patch = (dict: Partial<IDictionary>) =>
   fetch(
      `${API_BASE}/dict/${dict.input ?? dict.mic?.word ?? ""}`,
      jsonInit(dict, "PATCH"),
   );

export const dict_delete = (word: string) =>
   fetch(`${API_BASE}/dict/${encodeURIComponent(word)}`, { method: "DELETE" });

export const ecdict_get = async () => fetch(`${API_BASE}/ecdict`);

export const issue_get = () => getJson<Array<IIssue>>(`${API_BASE}/issue`);

export const issue_delete = async (id: string) =>
   fetch(`${API_BASE}/issue/${encodeURIComponent(id)}`, { method: "DELETE" });

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
