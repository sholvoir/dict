import { STATUS_CODE } from "@sholvoir/generic/http";
import Button from "@sholvoir/solid-components/button-ripple";
import TextInput from "@sholvoir/solid-components/input-text";
import List from "@sholvoir/solid-components/list";
import { createSignal, For, onMount, Show, type Signal } from "solid-js";
import type { IDict, IEntry } from "#srv/lib/imic.ts";
import { version } from "../package.json" with { type: "json" };
import Dialog from "./dialog.tsx";
import Ecard from "./ecard.tsx";
import * as srv from "./server.ts";

export default () => {
   const [tips, setTips] = createSignal("");
   let timeout: number | undefined;
   const hideTips = () => setTips("");
   const showTips = (content: string, autohide = true) => {
      setTips(content);
      if (autohide) {
         if (timeout !== undefined) {
            clearTimeout(timeout);
            timeout = undefined;
         }
         timeout = setTimeout(hideTips, 3000);
      }
   };
   const [hideDict, setHideDict] = createSignal(false);
   const [hideVT, setHideVT] = createSignal(false);
   const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());

   const [vocabularyView, setVocabularyView] = createSignal("");
   const downloadVpobabulary = async () => {
      const vocab = await srv.getVocabulary();
      if (vocab) setVocabulary(new Set(vocab.words));
   };
   const handleLoadVocabularyClick = () => {
      downloadVpobabulary();
      setVocabularyView(Array.from(vocabulary()).sort().join("\n"));
   };
   const handleAddToVocabularyClick = async () => {
      const res = await srv.postVocabulary(vocabularyView());
      if (res.ok) {
         const words = vocabularyView().split("\n");
         const vocab = vocabulary();
         for (const word of words) vocab.add(word.trim());
         setVocabularyView("");
         showTips("上传成功");
         setVocabulary(vocab);
      } else showTips("上传失败");
   };
   const handleDeleteFromVocabularyClick = async () => {
      const res = await srv.deleteVocabulary(vocabularyView());
      if (res.ok) {
         const words = vocabularyView().split("\n");
         const vocab = vocabulary();
         for (const word of words) vocab.delete(word);
         setVocabularyView("");
         showTips("删除成功");
      } else showTips("删除失败");
   };

   const [word, setWord] = createSignal("");
   const [currentWord, setCurrentWord] = createSignal("_");
   const [currentCardIndex, setCurrentCardIndex] = createSignal(0);
   const [entries, setEntries] = createSignal<Array<Signal<IEntry>>>([]);
   const [entriesChanged, setEntriesChanged] = createSignal(false);
   const handleSearchClick = async () => {
      const w = encodeURIComponent(word());
      window.open(
         `https://www.merriam-webster.com/dictionary/${w}`,
         "merriam-webster",
      );
      window.open(
         `https://www.oxfordlearnersdictionaries.com/us/search/english/?q=${w}`,
         "oxfordlearnersdictionaries",
      );
      const dict = (await srv.getDict(word())) as IDict;
      if (!dict) return showTips("Not Found");
      setCurrentWord(dict.word);
      setCurrentCardIndex(0);
      setEntries((dict.entries ?? []).map((e) => createSignal(e)));
      setEntriesChanged(false);
      window.focus();
   };
   const handleAddCardClick = async () => {
      const dict = (await srv.getDict(word(), true)) as IDict;
      if (dict) setEntries([...entries(), createSignal(dict.entries?.[0]!)]);
   };
   const handleDeleteCardClick = () => {
      if (entries().length > 1)
         setEntries(entries().toSpliced(currentCardIndex(), 1));
      if (currentCardIndex() >= entries().length)
         setCurrentCardIndex(entries().length - 1);
   };
   const handleUpdateClick = async () => {
      const dict: IDict = {
         word: word(),
         entries: entries().map((e) => e[0]()),
      };
      showTips(
         (await srv.putDict(dict))
            ? `success update word "${word()}"!`
            : "Error",
      );
      setEntriesChanged(false);
   };
   const handleDeleteClick = async () => {
      showTips(
         (await srv.deleteDict(word()))
            ? `success delete word "${word()}"!`
            : "Error",
      );
   };

   const [currentIssueIndex, setCurrentIssueIndex] = createSignal(0);
   const [issues, setIssues] = createSignal<Array<{ issue: string }>>([]);

   const handleECClick = async () => {
      const resp = await srv.getEcdict();
      if (resp.ok) {
         showTips("EC导入成功");
         await handleLoadIssueClick();
      } else showTips("EC导入失败");
   };

   const handleLoadIssueClick = async () => {
      const issues = await srv.getIssues();
      if (issues) {
         setIssues(issues);
         handleIssueClick();
      }
   };
   const handleIssueClick = () => {
      const issue = issues()[currentIssueIndex()];
      if (issue) {
         setWord(issue.issue);
         handleSearchClick();
      }
   };
   const handleProcessIssueClick = async () => {
      if (entriesChanged()) await handleUpdateClick();
      const issue = issues()[currentIssueIndex()];
      if (!issue) return await handleLoadIssueClick();
      switch ((await srv.deleteIssue(issue.issue)).status) {
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
      setIssues((issues) => issues.filter((_, i) => i !== currentIssueIndex()));
      if (issues().length && currentIssueIndex() >= issues().length)
         setCurrentIssueIndex(issues().length - 1);
      if (issues().length) handleIssueClick();
      else {
         setWord("");
         setCurrentWord("_");
         setEntries([]);
         setCurrentCardIndex(0);
         handleLoadIssueClick();
      }
      showTips("处理成功!");
   };
   const handleOriginClick = () => {
      window.open(
         `https://dict.micinfotech.com/api/v2/dict?q=${word()}`,
         "dict",
      );
   };
   onMount(() => (downloadVpobabulary(), handleLoadIssueClick()));
   return (
      <Dialog
         left={version}
         title={<span class="font-mono">系统管理&nbsp;ˈθʒɔɑɜæəɪʌʊɡʃðˌ</span>}
         right={`${issues().length}`}
         tips={tips}
         class="flex flex-col gap-2 p-2"
      >
         <Show when={!hideDict()}>
            <div class="h-4 grow-4 flex flex-col gap-2">
               <div class="grow flex gap-2">
                  <For each={entries()}>
                     {(entry, i) => (
                        <Ecard
                           class="grow"
                           word={word()}
                           entry={entry}
                           showTips={showTips}
                           entryChanged={() => setEntriesChanged(true)}
                           onClick={() => setCurrentCardIndex(i())}
                        />
                     )}
                  </For>
               </div>
               <div class="flex justify-between gap-2">
                  <TextInput
                     name="word"
                     placeholder="word"
                     class="grow"
                     binding={[word, setWord]}
                     options={vocabulary()}
                     onChange={handleSearchClick}
                  />
                  <Button
                     class="button btn-normal"
                     disabled={!word()}
                     onClick={handleOriginClick}
                  >
                     Origin
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={!word()}
                     onClick={handleSearchClick}
                  >
                     Search
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleAddCardClick}
                  >
                     增卡
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={
                        word() !== currentWord() || entries().length <= 1
                     }
                     onClick={handleDeleteCardClick}
                  >
                     {`删卡${currentCardIndex()}`}
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleDeleteClick}
                  >
                     删除
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleUpdateClick}
                  >
                     更新
                  </Button>
                  <Button
                     class="button btn-normal"
                     onClick={() => setHideVT((h) => !h)}
                  >
                     <span
                        class={`text-[150%] align-bottom icon--mdi ${
                           hideVT()
                              ? "icon--mdi--chevron-up"
                              : "icon--mdi--chevron-down"
                        }`}
                     />
                  </Button>
               </div>
            </div>
         </Show>
         <Show when={!hideVT()}>
            <div class={`flex gap-2 ${hideDict() ? "grow" : "max-h-48"}`}>
               <textarea
                  class="w-1 grow"
                  value={vocabularyView()}
                  onChange={(e) => setVocabularyView(e.currentTarget.value)}
               />
               <div class="flex flex-col gap-1">
                  <Button
                     class="button btn-normal"
                     onClick={handleLoadVocabularyClick}
                  >
                     加载
                  </Button>
                  <Button
                     class="button btn-normal"
                     onClick={handleAddToVocabularyClick}
                  >
                     上传
                  </Button>
                  <Button
                     class="button btn-normal"
                     onClick={handleDeleteFromVocabularyClick}
                  >
                     删除
                  </Button>
               </div>
               <div class="w-1 grow border overflow-y-auto [scrollbar-width:none]">
                  <List
                     class="px-2"
                     cindex={[currentIssueIndex, setCurrentIssueIndex]}
                     activeClass="bg-[var(--bg-title)]"
                     options={issues()}
                     func={(issue) => issue.issue}
                     onClick={handleIssueClick}
                  />
               </div>
               <div class="flex flex-col gap-1">
                  <Button
                     class="button btn-normal"
                     onClick={() => setHideDict((h) => !h)}
                  >
                     <span
                        class={`text-[150%] align-bottom icon--mdi ${
                           hideDict()
                              ? "icon--mdi--chevron-down"
                              : "icon--mdi--chevron-up"
                        }`}
                     />
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleProcessIssueClick}
                  >
                     处理
                  </Button>
                  <Button class="button btn-normal" onClick={handleECClick}>
                     EC
                  </Button>
               </div>
            </div>
         </Show>
      </Dialog>
   );
};
