import Button from "@sholvoir/solid-components/button-ripple";
import { createSignal } from "solid-js";
import * as srv from "./server.ts";
import { showTips } from "./tips.ts";

export default (props: {
   vocabulary: Set<string>;
   downloadVocabulary: () => Promise<void>;
}) => {
   const [vocabulary, setVocabulary] = createSignal("");
   const handleLoadVocabularyClick = async () => {
      await props.downloadVocabulary();
      setVocabulary(Array.from(props.vocabulary).sort().join("\n"));
   };
   const handleAddToVocabularyClick = async () => {
      const res = await srv.postVocabulary(vocabulary());
      if (res.ok) {
         const words = vocabulary().split("\n");
         for (const word of words) props.vocabulary.add(word.trim());
         setVocabulary("");
         showTips("上传成功");
      } else showTips("上传失败");
   };
   const handleDeleteFromVocabularyClick = async () => {
      const res = await srv.deleteVocabulary(vocabulary());
      if (res.ok) {
         const words = vocabulary().split("\n");
         for (const word of words) props.vocabulary.delete(word);
         setVocabulary("");
         showTips("删除成功");
      } else showTips("删除失败");
   };
   return (
      <>
         <textarea
            class="w-1 grow"
            name="vocabulary"
            value={vocabulary()}
            onChange={(e) => setVocabulary(e.currentTarget.value)}
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
      </>
   );
};
