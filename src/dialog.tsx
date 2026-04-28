import { type Accessor, type JSX, Show, splitProps } from "solid-js";

export type DialogProps = {
   bottom?: JSX.Element;
   left?: JSX.Element;
   leftClick?: () => void;
   noleft?: boolean;
   right?: JSX.Element;
   tips?: Accessor<string | undefined>;
   title: JSX.Element;
   tools?: JSX.Element;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "title">;

export default (props: DialogProps) => {
   const [local, others] = splitProps(props, [
      "bottom",
      "children",
      "class",
      "left",
      "leftClick",
      "noleft",
      "right",
      "tips",
      "title",
      "tools",
   ]);
   return (
      <>
         <div
            class={`title shrink-0 px-2 flex justify-between items-center font-bold ${
               local.tips?.() ? "bg-(--bg-accent)" : "bg-(--bg-title)"
            } text-center`}
         >
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.left}>{local.left}</Show>
            </div>
            <div class="grow font-bold [app-region:drag]">
               {local.tips?.() || local.title}
            </div>
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.right}>{local.right}</Show>
            </div>
         </div>
         <Show when={local.tools}>{local.tools}</Show>
         <div class={`body relative grow h-0 ${local.class ?? ""}`} {...others}>
            {local.children}
         </div>
         <Show when={local.bottom}>{local.bottom}</Show>
      </>
   );
};
