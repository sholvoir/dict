import { parse as yamlParse } from '$std/yaml/parse.ts';
import { useEffect, useRef } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { IDict } from "../lib/idict.ts";
import Cookies from "js-cookie";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";

const baseApi = '/api';
//const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
const vocabularyUrl = 'https://www.sholvoir.com/vocabulary/0.0.1/vocabulary.json';
const revisionUrl = 'https://www.sholvoir.com/vocabulary/0.0.1/revision.yaml';
const inputNames = ['word','pic','trans','sound','phonetic'];
type InputName = typeof inputNames[number];
let vocabulary: Record<string, string>;
let revision: Record<string, string>;

export default function Lookup() {
    const auth = Cookies.get('auth');
    const ini = useSignal(false);
    const inputs: Record<InputName, Signal<string>> = {};
    for (const name of inputNames) inputs[name] = useSignal('');
    const tips = useSignal('');
    const player = useRef<HTMLAudioElement>(null);
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const hideTips = () => tips.value = '';
    const handleInput = (ev: Event) => {
        const target = ev.target as HTMLInputElement|HTMLTextAreaElement;
        inputs[target.name].value = target.value;
    }
    const handleSearchClick = async () => {
        let word = inputs['word'].value;
        if (!word || !vocabulary || !revision) return showTips(`${!word}, ${!vocabulary}, ${!revision}`);
        if (!vocabulary[word] && !(word = revision[word])) return showTips("Not Found!");
        const res = await fetch(`${baseApi}/${encodeURIComponent(word)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            inputs['word'].value = word;
            inputs['pic'].value = dic.pic ?? ''
            inputs['trans'].value = dic.trans ?? '';
            inputs['sound'].value = dic.sound ?? '';
            inputs['phonetic'].value = dic.phonetic ?? '';
        } else showTips(`Error: ${res.status}`);
    }
    const handlePlayClick = () => {
        if (!inputs['sound'].value) return showTips('no sound to play!');
        player.current?.play();
    }
    const handleUpdateClick = async () => {
        const dict: IDict = {
            pic: inputs['pic'].value,
            trans: inputs['trans'].value,
            sound: inputs['sound'].value,
            phonetic: inputs['phonetic'].value
        };
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`,
            { method: 'PATCH', cache: 'no-cache', body: JSON.stringify(dict) }
        );
        if (res.ok) showTips(`success update word "${inputs['word'].value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const handleDeleteClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`,
            { method: 'DELETE', cache: 'no-cache' }
        );
        if (res.ok) showTips(`success delete word "${inputs['word'].value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const init = async () => {
        const res1 = await fetch(vocabularyUrl);
        if (!res1.ok) return console.error(res1.status);
        vocabulary = await res1.json();
        const res2 = await fetch(revisionUrl);
        if (!res2.ok) return console.error(res2.status);
        revision = yamlParse(await res2.text()) as Record<string, string>;
        ini.value = true;
    };
    useEffect(() => { init().catch(console.error) }, []);
    return <div class="p-2 mx-auto w-[390px] flex flex-col gap-2 [&>input]:px-2 [&>input]:border [&>textarea]:px-2 [&>textarea]:border">
        <div class="absolute top-0 inset-x-[10%] bg-[#ff08] text-center rounded-md " onClick={hideTips}>{tips.value}</div>
        <input type="text" name="word" placeholder="word" value={inputs['word'].value} onInput={handleInput} onChange={handleSearchClick}/>
        <input type="text" name="phonetic" placeholder="phonetic" value={inputs['phonetic'].value} onInput={handleInput}/>
        <textarea name="trans" placeholder="trans" class="h-32" value={inputs['trans'].value} onInput={handleInput}/>
        {/*<div class="flex gap-2">
            <img class="max-h-[480px] max-w-[720px]" src={inputs['pic'].value || noImage}/>
            <textarea name="pic" placeholder="pic" class="grow border px-2"
                value={inputs['pic'].value} onInput={handleInput}/>
        </div>*/}
        <textarea name="sound" placeholder="sound" class="h-32" value={inputs['sound'].value} onInput={handleInput}/>
        <div class="w-full flex gap-2 [&>button]:w-20 [&>button]:border [&>button]:rounded-md [&>button]:px-2 [&>button]:bg-indigo-700 [&>button]:text-white">
            <button class="disabled:opacity-50 disabled:bg-gray-500"
                type="button" disabled={!ini.value || !inputs['word'].value} onClick={handleSearchClick}>Search</button>
            <button class="disabled:opacity-50 disabled:bg-gray-500"
                type="botton" disabled = {!auth || !inputs['word'].value} onClick={handleDeleteClick}>Delete</button>
            <button class="disabled:opacity-50 disabled:bg-gray-500"
                type="botton" disabled = {!auth || !inputs['word'].value} onClick={handleUpdateClick}>Update</button>
            <div class="grow"/>
            <menu class="aira-disabled:opacity-50" type="botton" onClick={handlePlayClick}
                aria-disabled={!inputs['sound'].value}><IconPlayerPlayFilled class="w-6 h-6"/></menu>
        </div>
        <audio ref={player} src={inputs['sound'].value}/>
    </div>;
}
