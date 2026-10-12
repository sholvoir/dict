import type { IDict, IEntry } from "@sholvoir/dict-server/src/lib/imic.ts";
import Button from "@sholvoir/solid-components/button-ripple";
import TextInput from "@sholvoir/solid-components/input-text";
import { createSignal, For } from "solid-js";
import { createStore, type Part } from "solid-js/store";
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
   const [isChanged, setChanged] = createSignal(false);

   const handleSearchClick = async () => {
      const word = cword();
      const dictionary = await srv.getDictionary(word);
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

   const handleEntryChange = (
      index: number,
      propName: Part<IEntry, keyof IEntry>,
      value: string,
   ) => {
      setDict("entries", index, propName, value);
      setChanged(true);
   };

   const handleEntryDelete = (index: number) => {
      setDict("entries", (entries) => entries.filter((_, i) => i !== index));
      setChanged(true);
   };

   const handleCopyClick = async () => {
      let results = `${dict.word} --\n`;
      for (const entry of dict.entries)
         if (entry.meanings && entry.pos !== "ecdict") {
            results += `${entry.pos}:\n`;
            for (const meaning of entry.meanings.split("\n"))
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
                  index={i()}
                  onChange={handleEntryChange}
                  onDelete={handleEntryDelete}
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
               onClick={handleAddEntryClick}
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
