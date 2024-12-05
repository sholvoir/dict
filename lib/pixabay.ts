import { IDictP } from "./common.ts";

const baseUrl = 'https://pixabay.com/api/';
const key = Deno.env.get('PIXABAY_KEY');

const fillPic = async (dict: IDictP, word: string): Promise<void> => {
    const resp = await fetch(`${baseUrl}?key=${key}&q=${encodeURIComponent(word)}&orientation=vertical&safesearch=1`);
    if (!resp.ok) return;
    const content = await resp.json();
    if (!content.hits?.length) return;
    const random = Math.floor(Math.random() * content.hits.length)
    dict.modified = dict.pic = content.hits[random].previewURL.replace('_150.', '_1280.');
}

export default fillPic;

if (import.meta.main) {
    const dict = {};
    await fillPic(dict, Deno.args[0])
    console.log(dict);
}