import type { IDict } from "@sholvoir/dict-server/src/lib/imic.ts";
import Button from "@sholvoir/solid-components/button-ripple";
import TextInput from "@sholvoir/solid-components/input-text";
import Tab from "@sholvoir/solid-components/tab";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { stringify } from "yaml";
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
   const [entryIndex, setEntryIndex] = createSignal(0);
   const [isChanged, setChanged] = createSignal(false);

   const handleSearchClick = async () => {
      const word = cword();
      const dictionary = await srv.getDictionary(word, true);
      const dict = dictionary?.mic;
      if (!dict) return showTips("Not Found");
      setDict(dict);
      setChanged(false);
   };

   const handleUpdateClick = async () => {
      if (isChanged() && dict.word === cword()) {
         showTips(
            (await srv.putDict(dict))
               ? `success update word "${cword()}"!`
               : "Error",
         );
         setChanged(false);
      }
   };

   const handleOriginClick = () => {
      window.open(
         `https://dict.micinfotech.com/api/v2/dict?q=${cword()}`,
         "dict",
      );
   };

   const handleDeleteClick = async () => {
      showTips(
         (await srv.deleteDict(cword()))
            ? `success delete word "${cword()}"!`
            : "Error",
      );
   };

   const handleAddEntryClick = async () => {
      setDict("entries", (entries) => (entries ? [...entries, {}] : [{}]));
   };

   const handleDeleteEntryClick = () => {
      setDict("entries", (entries) => entries.toSpliced(entryIndex(), 1));
      if (entryIndex() >= (dict.entries?.length ?? 0))
         setEntryIndex((dict.entries?.length ?? 0) - 1);
   };

   const handleCopyClick = async () => {
      let results = `${cword()} --\n`;
      for (const entry of dict.entries) {
         const meanings = entry.meanings;
         if (meanings)
            for (const [pos, means] of Object.entries(meanings)) {
               if (pos !== "ecdict")
                  results += stringify(Object.fromEntries([[pos, means]]), {
                     lineWidth: 0,
                  });
            }
      }
      navigator.clipboard.writeText(results);
      showTips("copied");
   };

   props.registerUpdate(handleUpdateClick);
   props.registerSearch((word) => (setCWord(word), handleSearchClick()));

   return (
      <div class="h-4 grow flex flex-col gap-2">
         <div class="grow flex flex-col">
            <Show when={dict.entries?.length}>
               <Tab
                  activeClass="bg-(--bg-tab)"
                  index={entryIndex()}
                  onTabSelected={setEntryIndex}
                  options={dict.entries!.map((en) => en.pos ?? "")}
               />
               <section class="grow p-2 bg-(--bg-tab)">
                  <Entry
                     class="grow"
                     word={dict.word}
                     entry={dict.entries![entryIndex()]}
                     onPosChange={(pos) =>
                        setDict("entries", entryIndex(), "pos", pos)
                     }
                     onSoundChange={(sound) =>
                        setDict("entries", entryIndex(), "sound", sound)
                     }
                     onPhoneticChange={(phonetic) =>
                        setDict("entries", entryIndex(), "phonetic", phonetic)
                     }
                     onMeaningsChange={(meanings) =>
                        setDict("entries", entryIndex(), "meanings", meanings)
                     }
                  />
               </section>
            </Show>
         </div>
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
               onClick={handleAddEntryClick}
            >
               新条目
            </Button>
            <Button
               class="button btn-normal"
               disabled={
                  dict.word !== cword() || (dict.entries?.length ?? 0) <= 1
               }
               onClick={handleDeleteEntryClick}
            >
               删条目
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
