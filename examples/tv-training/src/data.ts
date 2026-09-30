/** 本地演示数据，可替换为应用自己的内容接口。 */
export const lessons = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: ["观察规律", "寻找朋友", "图形接龙", "数字旅行"][index % 4] ?? "探索练习",
  note: ["观察 · 发现", "思考 · 配对", "想象 · 创造"][index % 3] ?? "轻松探索",
}));
