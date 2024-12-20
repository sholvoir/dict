import { Handlers } from "$fresh/server.ts";
import { badRequest, internalServerError, notFound } from '@sholvoir/generic/http';

export const handler: Handlers = {
    async GET(req) {
        try {
            const soundUrl = new URL(req.url).searchParams.get('q');
            if (!soundUrl) return badRequest;
            const reqInit = { headers: { 'User-Agent': req.headers.get('User-Agent') || 'Thunder Client (https://www.thunderclient.com)'} }
            const resp = await fetch(soundUrl, reqInit);
            if (!resp.ok) return notFound;
            const headers = new Headers();
            resp.headers.forEach((value, key) => headers.set(key, value));
            headers.set('Cache-Control', 'public, max-age=31536000');
            return new Response(resp.body, { headers });
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    }
};
