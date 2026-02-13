import Button from "@sholvoir/solid-components/button-ripple";
import type { TextAreaTargeted } from "@sholvoir/solid-components/targeted";
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
   const [entry, setEntry] = props.entry;
   const [parseError, setParseError] = createSignal(false);
   let player!: HTMLAudioElement;
   const handlePlayClick = () => {
      if (!entry().sound) props.showTips("no sound to play!");
      else player.play();
   };
   const handleMeaningsChange = (e: InputEvent & TextAreaTargeted) => {
      try {
         const meanings = parse(e.currentTarget.value);
         setParseError(false);
         setEntry((en) => ({ ...en, meanings }));
      } catch {
         setParseError(true);
      }
   };
   const handleTTClick = () => {
      const meanings: Record<string, string[]> = {};
      if (entry().meanings)
         for (const [pos, means] of Object.entries(entry().meanings!)) {
            if (pos !== "ecdict")
               meanings[pos] = means.map((m) => `${m} <tt></tt>`);
            else meanings[pos] = means;
         }
      setEntry((en) => ({ ...en, meanings }));
   };
   const handleOriginClick = () => {
      window.open(
         `https://dict.micinfotech.com/api/v2/dict?q=${props.word}`,
         "dict",
      );
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
            <Button class="button btn-normal" onClick={handleTTClick}>
               TT
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
            <Button class="button btn-normal" onClick={handleOriginClick}>
               Origin
            </Button>
         </div>
         <textarea
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
