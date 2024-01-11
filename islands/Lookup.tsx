import { Signal, useSignal } from "@preact/signals";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import { IDict } from "../lib/idict.ts";

const baseApi = '/api';
const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
const inputNames = ['word','pic','trans','sound','phonetic'];
type InputName = typeof inputNames[number];

export default function Lookup() {
    const prompt = useSignal('');
    const inputs: Record<InputName, Signal<string>> = {};
    for (const name of inputNames) inputs[name] = useSignal('');
    const handleInput = (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        inputs[target.name].value = target.value;
    }
    const handleSearchClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            inputs['phonetic'].value = dic.phonetic!;
            inputs['trans'].value = dic.trans!;
            inputs['sound'].value = dic.sound!;
            prompt.value = '';
        } else {
            prompt.value = await res.text();
        }
    }
    const handlePlayClick = () => {
        if (inputs['sound'].value) {
            try {
                (new Audio(inputs['sound'].value)).play();
                prompt.value = '';
            } catch (e) {
                prompt.value = e.toString();
            }
        } else {
            prompt.value = 'no sound to play!';
        }
    }
    const handleUpdateClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`, {
            method: 'PATCH',
            cache: 'no-cache',
            body: JSON.stringify({ trans: inputs['trans'].value, sound: inputs['sound'].value, phonetic: inputs['phonetic'].value })
        });
        if (res.ok) {
            prompt.value = (`success upate word "${inputs['word'].value}"!`);
        } else {
            prompt.value = (await res.text());
        }
    }
    return <div class="[&>div]:m-1 [&>div]:flex [&>div]:gap-2">
        <div class="text-red-500">{prompt}</div>
        <div>
            <input type="text" name="word" placeholder="word"
                class="grow border px-2" value={inputs['word'].value}
                onInput={handleInput} onChange={handleSearchClick}/>
            <button type="button" class="w-20 border rounded-md px-2 bg-blue-800 text-white"
                onClick={handleSearchClick}>Search</button>
        </div>
        <div>
            <input type="text" name="phonetic" placeholder="phonetic"
                class="border px-2 mr-2" value={inputs['phonetic'].value} onInput={handleInput}/>
            <input type="text" name="sound" placeholder="sound"
                class="grow border px-2" value={inputs['sound'].value} onInput={handleInput} />
            <IconPlayerPlayFilled class="w-6 h-6" onClick={handlePlayClick} />
        </div>
        <div class="justify-center">
            <img class="max-h-[480px] max-w-[720px]" src={inputs['pic'].value || noImage}/>
        </div>
        <div>
            <input type="text" name="pic" placeholder="pic"
                class="grow border px-2" value={inputs['pic'].value}
                onInput={handleInput} />
        </div>
        <div>
            <input type="text" name="trans" placeholder="trans"
                class="grow border px-2" value={inputs['trans'].value}
                onInput={handleInput} />
        </div>
        <div class="justify-end">
            <button type="botton" class="w-20 border rounded-md px-2 bg-blue-800 text-white"
                onClick={handleUpdateClick}>Update</button>
        </div>
    </div>;
}
