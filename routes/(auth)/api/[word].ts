import { Handlers } from "$fresh/server.ts";
import { badRequest, notFound, ok, internalServerError, responseInit } from '@sholvoir/generic/http';
import { IDict } from "../../../lib/idict.ts";
import { getAll as youdaoAll } from '../../../lib/youdao.ts';
import { getPhoneticSound as dictPhoneticSound } from "../../../lib/dictionary.ts";
import { getSound as websterSound } from "../../../lib/webster.ts";
import { getPic as pixabayGetPic } from '../../../lib/pixabay.ts';

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers = {
    async GET(_req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([category, word]);
            const value = res.value as IDict;
            if (!value) return notFound;
            let modified = false;
            if (!value.sound && (value.sound = (await websterSound(word)).sound)) modified = true;
            if (!value.trans || !value.phonetic || !value.sound) {
                const dict = await youdaoAll(word);
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
                if (!value.trans && (value.trans = dict.trans)) modified = true;
                if (!value.sound && (value.sound = dict.sound)) modified = true;
            }
            if (!value.sound || !value.phonetic) {
                const dict = await dictPhoneticSound(word);
                if (!value.sound && (value.sound = dict.sound)) modified = true;
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
            }
            if (!value.pic && (value.pic = (await pixabayGetPic(word)).pic)) modified = true;
            if (modified) await kv.set([category, word], value);
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
