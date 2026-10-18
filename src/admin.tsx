import BButton from "@sholvoir/solid-components/button-base";
import { createSignal, onMount, Show } from "solid-js";
import { version } from "../package.json" with { type: "json" };
import Dialog from "./dialog.tsx";
import Dict from "./dict.tsx";
import Issue from "./issue.tsx";
import * as srv from "./server.ts";
import { downloadVocabulary, vocabulary } from "./vocabulary.ts";
import Vocabulary from "./vocabulary.tsx";

export default () => {
   const [sversion, setSversion] = createSignal("");
   const [hideDict, setHideDict] = createSignal(false);
   const [hideVT, setHideVT] = createSignal(false);
   let searchWord: (word: string) => Promise<void>;
   let updateDict: () => Promise<void>;
   const registerSearch = (sr: (word: string) => Promise<void>) => {
      searchWord = sr;
   };
   const registerUpdateDict = (ud: () => Promise<void>) => {
      updateDict = ud;
   };
   const beforeProcessIssue = async () => {
      if (updateDict) await updateDict();
   };

   const search = async (wd: string) => searchWord?.(wd);

   onMount(() => {
      srv.version_get().then(setSversion);
      downloadVocabulary();
   });
   return (
      <Dialog
         left={`${sversion()}-${version.split(".")[2]}`}
         title={<span class="font-mono">系统管理&nbsp;ˈθʒɔɑɜæəɪʌʊɡʃðˌ</span>}
         right={
            <>
               <Show when={!(hideDict() || hideVT())}>
                  <BButton onClick={() => setHideVT(true)}>
                     <span class="text-[150%] align-bottom icon--mdi icon--mdi--chevron-down" />
                  </BButton>
                  <BButton onClick={() => setHideDict(true)}>
                     <span class="text-[150%] align-bottom icon--mdi icon--mdi--chevron-up" />
                  </BButton>
               </Show>
               <Show when={hideDict() || hideVT()}>
                  <BButton
                     onClick={() => (setHideDict(false), setHideVT(false))}
                  >
                     <span class="text-[150%] align-bottom icon--mdi icon--mdi--chevron-down-up" />
                  </BButton>
               </Show>
            </>
         }
         class="flex flex-col gap-2 p-2"
      >
         <Show when={!hideDict()}>
            <Dict
               registerSearch={registerSearch}
               registerUpdate={registerUpdateDict}
            />
         </Show>
         <Show when={!hideVT()}>
            <div class={`flex gap-2 ${hideDict() ? "grow" : "max-h-48"}`}>
               <Vocabulary
                  vocabulary={vocabulary}
                  downloadVocabulary={downloadVocabulary}
               />
               <Issue onSearch={search} beforeProcess={beforeProcessIssue} />
            </div>
         </Show>
      </Dialog>
   );
};
