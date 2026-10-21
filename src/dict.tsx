import type { IDict } from "@sholvoir/dict-server/src/lib/imic.ts";
import { STATUS_CODE } from "@sholvoir/generic/http";
import Button from "@sholvoir/solid-components/button-ripple";
import TextInput from "@sholvoir/solid-components/input-text";
import { createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import Entry from "./entry";
import * as srv from "./server.ts";
import { showTips } from "./tips.ts";
import { vocabulary } from "./vocabulary.ts";

export default (props: {
   registerSearch: (search: (word: string) => Promise<void>) => void;
   registerUpdate: (update: () => Promise<void>) => void;
}) => {
   const [dict, setDict] = createStore<IDict>({ word: "_", entries: [] });
   const [cword, setCWord] = createSignal("");
   let isChanged = false;

   const handleSearchClick = async () => {
      const word = cword();
      const w = encodeURIComponent(word);
      window.open(
         `https://www.merriam-webster.com/dictionary/${w}`,
         "merriam-webster",
      );
      window.open(
         `https://www.oxfordlearnersdictionaries.com/us/search/english/?q=${w}`,
         "oxfordlearnersdictionaries",
      );
      window.focus();
      const dictionary = await srv.dict_get(word);
      const mic = dictionary?.mic;
      if (!mic) return showTips("Not Found");
      setDict(mic);
      isChanged = false;
   };

   const handleUpdateClick = async () => {
      if (isChanged && dict.word === cword()) {
         setDict("version", Date.now());
         const res = await srv.dict_patch({ mic: dict });
         switch (res.status) {
            case STATUS_CODE.BadRequest:
               return showTips("更新失败, 输入数据错误!");
            case STATUS_CODE.InternalServerError:
               return showTips("更新失败, 服务器错误!");
            case STATUS_CODE.OK:
               isChanged = false;
               return showTips("更新成功!");
         }
      }
   };

   const handleOriginClick = () => {
      window.open(
         `https://dict.micinfotech.com/api/v2/dict/${encodeURIComponent(cword())}`,
         "dict",
      );
   };

   const handleDeleteClick = async () => {
      showTips(
         (await srv.dict_delete(cword()))
            ? `success delete word "${cword()}"!`
            : "Error",
      );
   };

   const handleCopyClick = async () => {
      let results = `${dict.word} --\n`;
      if (dict.entries)
         for (const entry of dict.entries)
            if (entry.meanings?.length && entry.pos !== "ecdict") {
               results += `${entry.pos}:\n`;
               if (entry.top) results += `${entry.top}\n`;
               for (const meaning of entry.meanings)
                  results += ` - ${meaning}\n`;
            }
      navigator.clipboard.writeText(results);
      showTips("copied");
   };

   props.registerUpdate(handleUpdateClick);
   props.registerSearch((word) => (setCWord(word), handleSearchClick()));

   return (
      <div class="h-4 grow flex flex-col gap-2">
         <For each={dict.entries}>
            {(entry, i) => (
               <Entry
                  class="grow"
                  entry={entry}
                  onDelete={() => (
                     setDict("entries", (entries) =>
                        entries?.filter((_, index) => i() !== index),
                     ),
                     (isChanged = true)
                  )}
                  onMeaningsChange={(meanings) => (
                     setDict("entries", i(), "meanings", meanings),
                     (isChanged = true)
                  )}
                  onPosChange={(pos) => (
                     setDict("entries", i(), "pos", pos), (isChanged = true)
                  )}
                  onPronouncesChange={(pronounces) => (
                     setDict("entries", i(), "pronounces", pronounces),
                     (isChanged = true)
                  )}
                  onPronouncesItemChange={(ip, key, value) => (
                     setDict("entries", i(), "pronounces", ip, key, value),
                     (isChanged = true)
                  )}
                  onTopChange={(top) => (
                     setDict("entries", i(), "top", top), (isChanged = true)
                  )}
                  word={dict.word}
               />
            )}
         </For>
         <div class="flex justify-between gap-2">
            <TextInput
               name="word"
               placeholder="word"
               class="grow"
               value={cword()}
               onInput={setCWord}
               options={vocabulary}
               onChange={handleSearchClick}
            />
            <Button
               class="button btn-normal"
               disabled={!cword()}
               onClick={handleOriginClick}
            >
               Origin
            </Button>
            <Button
               class="button btn-normal"
               disabled={!cword()}
               onClick={handleSearchClick}
            >
               Search
            </Button>
            <Button
               class="button btn-normal"
               disabled={dict.word !== cword()}
               onClick={() => (
                  setDict("entries", (entries) =>
                     entries ? [...entries, {}] : [{}],
                  ),
                  (isChanged = true)
               )}
            >
               新条目
            </Button>
            <Button
               class="button btn-normal"
               disabled={dict.word !== cword()}
               onClick={handleDeleteClick}
            >
               删除
            </Button>
            <Button
               class="button btn-normal"
               disabled={dict.word !== cword()}
               onClick={handleUpdateClick}
            >
               更新
            </Button>
            <Button
               class="button btn-normal"
               disabled={!dict.word}
               onClick={handleCopyClick}
            >
               Copy
            </Button>
         </div>
      </div>
   );
};
