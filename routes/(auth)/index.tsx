import { FreshContext } from "$fresh/server.ts";
import { jwt } from '../../lib/jwt.ts';
import Lookup from "../../islands/Lookup.tsx";
import { Cookie, setCookie } from "$std/http/cookie.ts";

export const handler = async (_req: Request, ctx: FreshContext) => {
  const resp = await ctx.render();
  if (ctx.state.user) {
    const maxAge = 180 * 24 * 60 * 60;
    const cookie: Cookie = {
      name: 'auth', value:
      await jwt.createToken(maxAge, { aud: ctx.state.user as string }),
      maxAge
    };
    setCookie(resp.headers, cookie);
  }
  return resp;
}

export default () => <div class="p-2 mx-auto max-w-screen-md">
  <img src="/dict.svg" class="w-32 h-32" />
  <Lookup />
</div>;
