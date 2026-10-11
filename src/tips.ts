import { createSignal } from "solid-js";

const [tips, setTips] = createSignal("");
let timeout: number | undefined;

export { tips };
export const hideTips = () => setTips("");
export const showTips = (content: string, autohide = true) => {
   setTips(content);
   if (autohide) {
      if (timeout !== undefined) {
         clearTimeout(timeout);
         timeout = undefined;
      }
      timeout = setTimeout(hideTips, 3000);
   }
};
