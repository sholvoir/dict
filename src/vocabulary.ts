import * as srv from "./server.ts";

export const vocabulary = new Set<string>();
export const downloadVocabulary = async () => {
   const vocab = await srv.vocabulary_get();
   if (vocab) {
      vocabulary.clear();
      for (const word of vocab.words) if (word) vocabulary.add(word);
   }
};
