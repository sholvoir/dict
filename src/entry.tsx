import type { IEntry, IPronounce } from "@sholvoir/dict-server/src/lib/imic";
import refine from "@sholvoir/dict-server/src/lib/refine.ts";
import Button from "@sholvoir/solid-components/button-ripple";
import { For, type JSX, Show } from "solid-js";
import Pronounce from "./pronounce";

const buttonClass = "flex-none button btn-normal";

export default (
   props: {
      entry: IEntry;
      onDelete: () => void;
      onMeaningsChange?: (ms: Array<string>) => void;
      onPosChange?: (p: string) => void;
      onPronouncesChange?: (ps: Array<IPronounce>) => void;
      onPronouncesItemChange?: (
         i: number,
         key: keyof IPronounce,
         v: IPronounce[typeof key],
      ) => void;
      onTopChange?: (t: string) => void;
      word: string;
   } & JSX.HTMLAttributes<HTMLDivElement>,
) => {
   let ta!: HTMLTextAreaElement;
   const taSelect = (start: number, end: number) => {
      ta.focus();
      ta.setSelectionRange(start, end);
   };
   const handleRefineClick = () => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      const r = refine(value.substring(selectionStart, selectionEnd));
      if (!r) return;
      const meanings =
         value.substring(0, selectionStart) + r + value.substring(selectionEnd);
      props.onMeaningsChange?.(meanings.split("\n"));
      taSelect(selectionStart, selectionStart + r.length);
   };
   const handleBIClick = (tag: "b" | "i" | "t") => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      const meanings =
         value.substring(0, selectionStart) +
         `<${tag}>` +
         value.substring(selectionStart, selectionEnd) +
         `</${tag}>` +
         value.substring(selectionEnd);
      props.onMeaningsChange?.(meanings.split("\n"));
      const l = tag.length + 2;
      taSelect(selectionStart + l, selectionEnd + l);
   };
   const handleParenthesesClick = (patenheses: "()" | "[]" | '""') => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      const meanings =
         value.substring(0, selectionStart) +
         patenheses[0] +
         value.substring(selectionStart, selectionEnd) +
         patenheses[1] +
         value.substring(selectionEnd);
      props.onMeaningsChange?.(meanings.split("\n"));
      taSelect(selectionStart + 1, selectionEnd + 1);
   };
   const handleRemoveClick = () => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      const meanings =
         value.substring(0, selectionStart - 1) +
         value.substring(selectionStart, selectionEnd) +
         value.substring(selectionEnd + 1);
      props.onMeaningsChange?.(meanings.split("\n"));
      taSelect(selectionStart - 1, selectionEnd - 1);
   };
   const handleTransClick = () => {
      if (!props.entry.meanings) return;
      const nmeanings: Array<string> = [];
      for (const meaning of props.entry.meanings) {
         if (
            (/^[[(<]/.test(meaning) && /[)\]>]$/.test(meaning)) ||
            meaning.endsWith("</t>")
         )
            nmeanings.push(meaning);
         else nmeanings.push(`${meaning} <t></t>`);
      }
      props.onMeaningsChange?.(nmeanings);
   };
   return (
      <div
         class={`bg-(--bg-title) p-2 flex flex-col h-full gap-2 ${props.class ?? ""}`}
         onClick={props.onClick}
      >
         <For each={props.entry.pronounces}>
            {(pronounce, i) => (
               <Pronounce
                  class="flex-none"
                  onDelete={() =>
                     props.onPronouncesChange?.(
                        props.entry.pronounces!.filter(
                           (_, index) => index !== i(),
                        ),
                     )
                  }
                  onPhoneticChange={(p) =>
                     props.onPronouncesItemChange?.(i(), "phonetic", p)
                  }
                  onSoundChange={(s) =>
                     props.onPronouncesItemChange?.(i(), "sound", s)
                  }
                  pronounce={pronounce}
                  word={props.word}
               />
            )}
         </For>
         <div class="flex-none flex gap-2">
            <input
               class="grow"
               name="pos"
               value={props.entry.pos}
               onInput={(e) => props.onPosChange?.(e.currentTarget.value)}
            />
            <Button class={buttonClass} onClick={handleRefineClick}>
               ^
            </Button>
            <Button class={buttonClass} onClick={handleRemoveClick}>
               ~
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick('""')}
            >
               &quot;&quot;
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick("()")}
            >
               ()
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick("[]")}
            >
               []
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("b")}>
               B
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("i")}>
               I
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("t")}>
               T
            </Button>
            <Button class={buttonClass} onClick={handleTransClick}>
               Trans
            </Button>
            <Button class={buttonClass} onClick={() => props.onTopChange?.("")}>
               Top
            </Button>
            <Button
               class={buttonClass}
               onClick={() =>
                  props.onPronouncesChange?.(
                     props.entry.pronounces?.length
                        ? [...props.entry.pronounces, {}]
                        : [{}],
                  )
               }
            >
               添加发音
            </Button>
            <Button class={buttonClass} onClick={() => props.onDelete()}>
               删本条目
            </Button>
         </div>
         <Show when={props.entry.top !== undefined}>
            <input
               value={props.entry.top}
               onInput={(e) => props.onTopChange?.(e.currentTarget.value)}
            />
         </Show>
         <textarea
            ref={ta}
            name="meanings"
            placeholder="meanings"
            class="h-32 grow font-mono"
            value={props.entry.meanings?.join("\n")}
            onInput={(e) =>
               props.onMeaningsChange?.(e.currentTarget.value.split("\n"))
            }
         />
      </div>
   );
};
