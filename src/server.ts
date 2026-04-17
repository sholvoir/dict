import { getJson, getText, jsonHeader, url } from "@sholvoir/generic/http";
import type { IDict } from "#srv/lib/imic";

const API_BASE = "/api/v2";

export const getEcdict = async () => fetch(`${API_BASE}/ecdict`);

export const getIssues = () =>
   getJson<Array<{ issue: string }>>(`${API_BASE}/issue`);

export const deleteIssue = async (issue: string) =>
   fetch(url(`${API_BASE}/issue`, { issue }), { method: "DELETE" });

export const getDict = (word: string, re?: true) =>
   getJson<IDict>(
      url(`${API_BASE}/dict`, { q: word, mic: "1", re: re ? "1" : undefined }),
   );

export const putDict = (dict: IDict) =>
   fetch(`${API_BASE}/dict`, {
      method: "PUT",
      headers: jsonHeader,
      body: JSON.stringify(dict),
   });

export const deleteDict = (word: string) =>
   fetch(url(`${API_BASE}/dict`, { q: word }), {
      method: "DELETE",
   });

export const getVocabulary = () =>
   getJson<{
      words: string[];
      checksum: string;
   }>(`${API_BASE}/vocabulary`);

export const postVocabulary = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, {
      method: "POST",
      body: words,
   });

export const deleteVocabulary = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, {
      method: "DELETE",
      body: words,
   });

export const version_get = () => getText(`${API_BASE}/version`);
