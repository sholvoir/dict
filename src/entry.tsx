import type { IEntry, IPronounce } from "@sholvoir/dict-server/src/lib/imic";
import Button from "@sholvoir/solid-components/button-ripple";
import type { TextAreaTargeted } from "@sholvoir/solid-components/targeted";
import { For, type JSX, Show } from "solid-js";
import Pronounce from "./pronounce";

const buttonClass = "flex-none button btn-normal";

export default (
   props: {
      entry: IEntry;
      onDelete: () => void;
      onMeaningsChange?: (ms: string) => void;
      onPosChange?: (p: string) => void;
      onPronouncesChange?: (ps: Array<IPronounce>) => void;
      onPronouncesItemChange?: (
         i: number,
         key: keyof IPronounce,
         v: IPronounce[typeof key],
      ) => void;
      onTopChange?: (t?: string) => void;
      word: string;
   } & JSX.HTMLAttributes<HTMLDivElement>,
) => {
   let ta!: HTMLTextAreaElement;
   const taSelect = (start: number, end: number) => {
      ta.focus();
      ta.setSelectionRange(start, end);
   };
   const handleKeyDown = (e: KeyboardEvent & TextAreaTargeted) => {
      if (e.key !== "Tab") return;
      if (!ta) return;
      e.preventDefault();
      const value = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = `${value.substring(0, start)}\t${value.substring(end)}`;
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      taSelect(start + 1, start + 1);
   };
   const handleBIClick = (tag: "b" | "i") => {
      if (!ta) return;
      const value = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value =
         value.substring(0, start) +
         `<${tag}>` +
         value.substring(start, end) +
         `</${tag}>` +
         value.substring(end);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      const l = tag.length + 2;
      taSelect(start + l, end + l);
   };
   const handleParenthesesClick = (patenheses: "（）" | "“”") => {
      if (!ta) return;
      const value = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value =
         value.substring(0, start) +
         patenheses[0] +
         value.substring(start, end) +
         patenheses[1] +
         value.substring(end);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      taSelect(start + 1, end + 1);
   };
   const handleRemoveClick = () => {
      if (!ta) return;
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      ta.value =
         value.substring(0, selectionStart - 1) +
         value.substring(selectionStart, selectionEnd) +
         value.substring(selectionEnd + 1);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      taSelect(selectionStart - 1, selectionEnd - 1);
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
            <Button class={buttonClass} onClick={handleRemoveClick}>
               ~
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick("“”")}
            >
               “”
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick("（）")}
            >
               （）
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("b")}>
               B
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("i")}>
               I
            </Button>
            <Button
               class={buttonClass}
               onClick={() =>
                  props.onTopChange?.(
                     props.entry.top === undefined ? "" : undefined,
                  )
               }
            >
               {props.entry.top === undefined ? "Add Top" : "Remove Top"}
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
            <textarea
               name="top"
               onFocus={(e) => (ta = e.currentTarget)}
               onInput={(e) => props.onTopChange?.(e.currentTarget.value)}
               onKeyDown={handleKeyDown}
               rows={1}
               value={props.entry.top}
            />
         </Show>
         <textarea
            class="h-32 grow font-mono"
            name="meanings"
            onFocus={(e) => (ta = e.currentTarget)}
            onInput={(e) => props.onMeaningsChange?.(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="meanings"
            value={props.entry.meanings}
         />
      </div>
   );
};
