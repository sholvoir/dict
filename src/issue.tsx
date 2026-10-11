import { STATUS_CODE } from "@sholvoir/generic/http";
import Button from "@sholvoir/solid-components/button-ripple";
import List from "@sholvoir/solid-components/list";
import { createSignal, onMount } from "solid-js";
import * as srv from "./server.ts";
import { showTips } from "./tips.ts";

export default (props: {
   onSearch: (w: string) => void;
   beforeProcess: () => Promise<void>;
}) => {
   const [issues, setIssues] = createSignal<Array<string>>([]);
   const [cindex, setCIndex] = createSignal(0);

   const loadIssues = async () => {
      const isses = await srv.getIssues();
      if (!isses?.length) {
         showTips("No more Issues!");
      } else {
         setIssues(isses.map((iss) => iss.issue));
         issueSelected();
      }
   };

   const issueSelected = () => {
      if (issues().length) {
         const issue = issues()[cindex()];
         if (issue) props.onSearch(issue);
      }
   };

   const handleECClick = async () => {
      const resp = await srv.getEcdict();
      if (resp.ok) {
         showTips("EC导入成功");
         await loadIssues();
      } else showTips("EC导入失败");
   };

   const handleProcessClick = async () => {
      await props.beforeProcess();
      if (!issues().length) return await loadIssues();
      const issue = issues()[cindex()];
      switch ((await srv.deleteIssue(issue)).status) {
         case STATUS_CODE.BadRequest:
            return showTips("输入异常");
         case STATUS_CODE.InternalServerError:
            return showTips("服务器错误");
         case STATUS_CODE.NotFound:
            return showTips("未找到");
         case STATUS_CODE.OK:
            break;
         default:
            return showTips("未知错误");
      }
      const nisses = setIssues((isses) => isses.filter((iss) => iss !== issue));
      if (cindex() >= nisses.length) setCIndex(nisses.length - 1);
      showTips("处理成功!");
      if (nisses.length) issueSelected();
      else loadIssues();
      // setWord("");
      // setCurrentWord("_");
      // setEntries([]);
      // setCurrentEntryIndex(0);
   };

   onMount(loadIssues);

   return (
      <>
         <div class="w-1 grow border overflow-y-auto scrollbar-none">
            <List
               activeClass="bg-(--bg-title)"
               index={cindex()}
               class="px-2"
               onItemSelect={(i) => (setCIndex(i), issueSelected)}
               options={issues()}
            />
         </div>
         <div class="flex flex-col gap-1">
            <Button class="button btn-normal" onClick={handleProcessClick}>
               处理
            </Button>
            <Button class="button btn-normal" onClick={handleECClick}>
               EC
            </Button>
         </div>
      </>
   );
};
