import { useData } from "vitepress";

/** 演示与页面共用当前语言，文案变化随语言导航更新。 */
export const useDocsText = (): { text: (chinese: string, english: string) => string } => {
  const { lang } = useData();
  return { text: (chinese, english) => (lang.value === "en" ? english : chinese) };
};
