import { Handlers } from "$fresh/server.ts";
import { badRequest, notFound, ok, internalServerError, responseInit } from '@sholvoir/generic/http';
import { blobToBase64 } from "@sholvoir/generic/blob";
import { IDict } from "../../../lib/idict.ts";
import youdao from '../../../lib/youdao.ts';
import dictionary from "../../../lib/dictionary.ts";
import webster from "../../../lib/webster.ts";
import pexels from "../../../lib/pexels.ts";
import pixabay from '../../../lib/pixabay.ts';

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');
const spliteNum = /^([A-Za-zèé /&''.-]+)(\d*)/;

export const handler: Handlers = {
    async GET(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([category, word]);
            const value = res.value as IDict;
            if (!value) return notFound;
            const m = spliteNum.exec(word);
            if (!m) return notFound;
            const rword = m[1];
            let modified = false;
            if (!value.sound && (value.sound = (await webster(rword)).sound)) modified = true;
            if (!value.trans || !value.phonetic || !value.sound) {
                const dict = await youdao(rword);
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
                if (!value.trans && (value.trans = dict.trans)) modified = true;
                if (!value.sound && (value.sound = dict.sound)) modified = true;
            }
            if (!value.sound || !value.phonetic || !value.def) {
                const dict = await dictionary(rword);
                if (!value.sound && (value.sound = dict.sound)) modified = true;
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
                if (!value.def && (value.def = dict.def)) modified = true;
            }
            if (!value.pic && (value.pic = (await pexels(rword)).pic)) modified = true;
            if (!value.pic && (value.pic = (await pixabay(rword)).pic)) modified = true;
            if (!value.pic && (value.pic = (await pexels('beautiful lady')).pic)) modified = true;
            if (!value.pic && (value.pic = (await pixabay('beautiful lady')).pic)) modified = true;
            if (!value.pic && (value.pic = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')) modified = true;
            if (modified) await kv.set([category, word], value);
            if (value.sound?.startsWith('http')) {
                const reqInit = { headers: { 'User-Agent': req.headers.get('User-Agent') || 'Thunder Client (https://www.thunderclient.com)'} }
                const resp = await fetch(value.sound, reqInit);
                if (resp.ok) value.sound = await blobToBase64(await resp.blob());
                else console.log(resp.status, await resp.text());
            }
            kv.close();
            return new Response(JSON.stringify(value), responseInit);
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
        
    },
    async PUT(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            await kv.set([category, word], value);
            kv.close();
            return ok;
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async PATCH(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            const res = await kv.get([category, word]);
            await kv.set([category, word], {...(res.value as IDict), ...value});
            kv.close();
            return ok;
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async DELETE(_req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([category, word]);
            if (res.value) {
                await kv.delete([category, word]);
                kv.close();
                return ok;
            } else {
                kv.close();
                return notFound;
            }
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    }
};
