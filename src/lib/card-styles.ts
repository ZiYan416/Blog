export const CARD_STYLES = {
  default: {
    label: "默认 (简约白/黑)",
    class: "bg-neutral-100 dark:bg-neutral-800",
    preview: "bg-neutral-100 dark:bg-neutral-800"
  },
  blue_sky: {
    label: "清爽蓝天",
    class: "bg-gradient-to-br from-blue-400 to-cyan-300 text-white",
    preview: "bg-gradient-to-br from-blue-400 to-cyan-300"
  },
  sunset: {
    label: "日落余晖",
    class: "bg-gradient-to-br from-orange-400 to-rose-400 text-white",
    preview: "bg-gradient-to-br from-orange-400 to-rose-400"
  },
  purple_dream: {
    label: "紫色梦境",
    class: "bg-gradient-to-br from-violet-500 to-purple-400 text-white",
    preview: "bg-gradient-to-br from-violet-500 to-purple-400"
  },
  fresh_mint: {
    label: "清新薄荷",
    class: "bg-gradient-to-br from-emerald-400 to-teal-300 text-white",
    preview: "bg-gradient-to-br from-emerald-400 to-teal-300"
  },
  midnight: {
    label: "深邃午夜",
    class: "bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200",
    preview: "bg-slate-900"
  },
  // 新增样式
  aurora: {
    label: "极光",
    class: "bg-gradient-to-br from-green-400 via-cyan-500 to-blue-500 text-white",
    preview: "bg-gradient-to-br from-green-400 via-cyan-500 to-blue-500"
  },
  cherry_blossom: {
    label: "樱花",
    class: "bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300 text-white",
    preview: "bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300"
  },
  ocean_depths: {
    label: "深海",
    class: "bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900 text-white",
    preview: "bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900"
  },
  fire: {
    label: "火焰",
    class: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white",
    preview: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"
  },
  cyberpunk: {
    label: "赛博朋克",
    class: "bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-600 text-white",
    preview: "bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-600"
  },
  luxury_gold: {
    label: "黑金",
    class: "bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-b-4 border-amber-500 text-amber-500",
    preview: "bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-b-4 border-amber-500"
  }
} as const;

export type CardStyleKey = keyof typeof CARD_STYLES;

export function getCardStyle(key?: string | null) {
  if (!key || !(key in CARD_STYLES)) return CARD_STYLES.default;
  return CARD_STYLES[key as CardStyleKey];
}
