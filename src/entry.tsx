import { type IEntry, Poses } from "@sholvoir/dict-server/src/lib/imic";
import refine from "@sholvoir/dict-server/src/lib/refine.ts";
import Button from "@sholvoir/solid-components/button-ripple";
import InputText from "@sholvoir/solid-components/input-text";
import type { JSX } from "solid-js";
import { showTips } from "./tips";

export default (
   props: {
      word: string;
      entry: IEntry;
      onPosChange: (pos: string) => void;
      onSoundChange: (sound: string) => void;
      onPhoneticChange: (phonetic: string) => void;
      onMeaningsChange: (meanings: string) => void;
   } & JSX.HTMLAttributes<HTMLDivElement>,
) => {
   let ta!: HTMLTextAreaElement;
   const taSelect = (start: number, end: number) => {
      ta.focus();
      ta.setSelectionRange(start, end);
   };
   let player!: HTMLAudioElement;
   const handlePlayClick = () => {
      if (!props.entry.sound) showTips("no sound to play!");
      else player.play();
   };
   const handleRefineClick = () => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      const r = refine(value.substring(selectionStart, selectionEnd));
      if (!r) return;
      props.onMeaningsChange(
         value.substring(0, selectionStart) + r + value.substring(selectionEnd),
      );
      taSelect(selectionStart, selectionStart + r.length);
   };
   const handleBIClick = (tag: "b" | "i" | "strong") => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      props.onMeaningsChange(
         value.substring(0, selectionStart) +
            `<${tag}>` +
            value.substring(selectionStart, selectionEnd) +
            `</${tag}>` +
            value.substring(selectionEnd),
      );
      const l = tag.length + 2;
      taSelect(selectionStart + l, selectionEnd + l);
   };
   const handleParenthesesClick = (patenheses: "()" | "[]" | '""') => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      props.onMeaningsChange(
         value.substring(0, selectionStart) +
            patenheses[0] +
            value.substring(selectionStart, selectionEnd) +
            patenheses[1] +
            value.substring(selectionEnd),
      );
      taSelect(selectionStart + 1, selectionEnd + 1);
   };
   const handleRemoveClick = () => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      props.onMeaningsChange(
         value.substring(0, selectionStart - 1) +
            value.substring(selectionStart, selectionEnd) +
            value.substring(selectionEnd + 1),
      );
      taSelect(selectionStart - 1, selectionEnd - 1);
   };
   const handleStrongClick = () => {
      if (!props.entry.meanings) return;
      const nmeanings: Array<string> = [];
      for (const meaning of props.entry.meanings.split("\n")) {
         if (
            (/^[[(<]/.test(meaning) && /[)\]>]$/.test(meaning)) ||
            meaning.endsWith("</strong>")
         )
            nmeanings.push(meaning);
         else nmeanings.push(`${meaning} <strong></strong>`);
      }
      props.onMeaningsChange(nmeanings.join("\n"));
   };
   return (
      <div
         class={`flex flex-col h-full gap-2 ${props.class ?? ""}`}
         onClick={props.onClick}
      >
         <div class="shrink flex gap-2">
            <InputText
               value={props.entry.pos}
               onInput={props.onPosChange}
               options={Poses}
            />
            <input
               name="phonetic"
               placeholder="phonetic"
               value={props.entry.phonetic}
               onInput={(e) => props.onPhoneticChange(e.currentTarget.value)}
            />
            <textarea
               name="sound"
               rows={1}
               placeholder="sound"
               class="grow-5"
               value={props.entry.sound}
               onInput={(e) => props.onSoundChange(e.currentTarget.value)}
            />
            <Button class="button btn-normal" onClick={handleRefineClick}>
               ^
            </Button>
            <Button class="button btn-normal" onClick={handleRemoveClick}>
               ~
            </Button>
            <Button
               class="button btn-normal"
               onClick={() => handleParenthesesClick('""')}
            >
               &quot;&quot;
            </Button>
            <Button
               class="button btn-normal"
               onClick={() => handleParenthesesClick("()")}
            >
               ()
            </Button>
            <Button
               class="button btn-normal"
               onClick={() => handleParenthesesClick("[]")}
            >
               []
            </Button>
            <Button
               class="button btn-normal"
               onClick={() => handleBIClick("b")}
            >
               B
            </Button>
            <Button
               class="button btn-normal"
               onClick={() => handleBIClick("i")}
            >
               I
            </Button>
            <Button
               class="button btn-normal"
               onClick={() => handleBIClick("strong")}
            >
               S
            </Button>
            <Button class="button btn-normal" onClick={handleStrongClick}>
               Strong
            </Button>
            <Button
               class="button btn-normal"
               onClick={() =>
                  props.onSoundChange(
                     `https://dict.youdao.com/dictvoice?type=2&audio=${props.word.replaceAll(" ", "+")}`,
                  )
               }
            >
               YDS
            </Button>
            <Button
               class="button btn-normal"
               onClick={handlePlayClick}
               disabled={!!props.entry.sound}
            >
               <span class="text-[120%] align-[-13%] icon--tdesign icon--tdesign--sound" />
            </Button>
         </div>
         <textarea
            ref={ta}
            name="meanings"
            placeholder="meanings"
            class="h-32 grow font-mono"
            value={props.entry.meanings}
            onInput={(e) => props.onMeaningsChange(e.currentTarget.value)}
         />
         <audio ref={player} src={props.entry.sound} />
      </div>
   );
};
