import Button from "@sholvoir/solid-components/button-ripple";
import { createSignal, type JSX, type Signal } from "solid-js";
import { parse, stringify } from "yaml";
import type { IEntry } from "#srv/lib/imic";

export default (
   props: {
      word: string;
      entry: Signal<IEntry>;
      showTips: (msg: string) => void;
      onClick: () => void;
   } & JSX.HTMLAttributes<HTMLDivElement>,
) => {
   let ta!: HTMLTextAreaElement;
   const [entry, setEntry] = props.entry;
   const [parseError, setParseError] = createSignal(false);
   let player!: HTMLAudioElement;
   const handlePlayClick = () => {
      if (!entry().sound) props.showTips("no sound to play!");
      else player.play();
   };
   const handleMeaningsChange = () => {
      try {
         const meanings = parse(ta.value);
         setParseError(false);
         setEntry((en) => ({ ...en, meanings }));
      } catch {
         setParseError(true);
      }
   };
   const handleStrongClick = () => {
      const meanings: Record<string, string[]> = {};
      if (entry().meanings)
         for (const [pos, means] of Object.entries(entry().meanings!)) {
            if (pos !== "ecdict")
               meanings[pos] = means.map((m) => `${m} <strong></strong>`);
            else meanings[pos] = means;
         }
      setEntry((en) => ({ ...en, meanings }));
   };
   const handleBIClick = (tag: "b" | "i") => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      ta.value =
         value.substring(0, selectionStart) +
         `<${tag}>` +
         value.substring(selectionStart, selectionEnd) +
         `</${tag}>` +
         value.substring(selectionEnd);
      ta.selectionStart = selectionStart + 3;
      ta.selectionEnd = selectionEnd + 3;
      handleMeaningsChange();
   };
   return (
      <div
         class={`flex flex-col h-full gap-2 ${props.class ?? ""}`}
         onClick={props.onClick}
      >
         <div class="shrink flex gap-2">
            <input
               name="phonetic"
               placeholder="phonetic"
               value={entry().phonetic}
               onFocus={props.onClick}
               onInput={(e) =>
                  setEntry((en) => ({ ...en, phonetic: e.currentTarget.value }))
               }
            />
            <textarea
               name="sound"
               rows={1}
               placeholder="sound"
               class="grow-5"
               value={entry().sound}
               onInput={(e) =>
                  setEntry((en) => ({ ...en, sound: e.currentTarget.value }))
               }
               onFocus={props.onClick}
            />
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
            <Button class="button btn-normal" onClick={handleStrongClick}>
               Strong
            </Button>
            <Button
               class="button btn-normal"
               onClick={() =>
                  setEntry((en) => ({
                     ...en,
                     sound: `https://dict.youdao.com/dictvoice?type=2&audio=${props.word.replaceAll(" ", "+")}`,
                  }))
               }
            >
               YDS
            </Button>
            <Button
               class="button btn-normal"
               onClick={handlePlayClick}
               disabled={!entry().sound}
            >
               <span class="text-[150%] align-bottom icon--material-symbols icon--material-symbols--chevron-right" />
            </Button>
         </div>
         <textarea
            ref={ta}
            name="meanings"
            placeholder="meanings"
            class={`h-32 grow font-mono ${parseError() ? "text-(--accent-color)" : ""}`}
            value={stringify(entry().meanings, { lineWidth: 0 })}
            onInput={handleMeaningsChange}
            onFocus={props.onClick}
         />
         <audio ref={player} src={entry().sound} />
      </div>
   );
};
