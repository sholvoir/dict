import type { IPronounce } from "@sholvoir/dict-server/src/lib/imic";
import { getWebsterSound } from "@sholvoir/dict-server/src/lib/webster-sound";
import Button from "@sholvoir/solid-components/button-ripple";
import type { JSX } from "solid-js";

const buttonClass = "flex-none button btn-normal";
const youdaoAudioBase = "https://dict.youdao.com/dictvoice?type=2&audio=";

export default (
   props: {
      onDelete?: () => void;
      onPhoneticChange?: (p: string) => void;
      onSoundChange?: (s: string) => void;
      pronounce: IPronounce;
      word: string;
   } & JSX.ButtonHTMLAttributes<HTMLDivElement>,
) => {
   let player!: HTMLAudioElement;
   return (
      <div class={`${props.class ?? ""} flex gap-2`}>
         <input
            class="w-36 shrink-0 flex-auto"
            name="phonetic"
            placeholder="phonetic"
            value={props.pronounce.phonetic}
            onInput={(e) => props.onPhoneticChange?.(e.currentTarget.value)}
         />
         <textarea
            name="sound"
            rows={1}
            placeholder="sound"
            class="grow-5"
            value={props.pronounce.sound}
            onInput={(e) => props.onSoundChange?.(e.currentTarget.value)}
         />
         <Button
            class={buttonClass}
            onClick={() => player.play()}
            disabled={!props.pronounce.sound}
         >
            <span class="text-[120%] align-[-13%] icon--tdesign icon--tdesign--sound" />
         </Button>
         <Button
            class={buttonClass}
            onClick={() =>
               props.onSoundChange?.(
                  `${youdaoAudioBase}${props.word.replaceAll(" ", "+")}`,
               )
            }
         >
            YDS
         </Button>
         <Button
            class={buttonClass}
            onClick={() => props.onSoundChange?.(getWebsterSound(props.word))}
         >
            MWS
         </Button>
         <Button class={buttonClass} onClick={() => props.onDelete?.()}>
            删读音
         </Button>
         <audio ref={player} src={props.pronounce.sound} />
      </div>
   );
};
