/**
 * UI Design System — 可复用的样式常量
 *
 * buttonVariants: 按钮变体
 * inputStyles:    输入框/选择框统一样式
 * cardStyles:     卡片容器样式
 * labelStyles:    标签文本样式
 */

export const buttonVariants = {
  primary:
    "inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors",
  secondary:
    "inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px] transition-colors",
  danger:
    "inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 min-h-[44px] transition-colors",
  ghost:
    "inline-flex items-center gap-1 px-3 py-2 text-sm text-teal-600 hover:text-teal-700 min-h-[44px] transition-colors",
  print:
    "inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 min-h-[44px] transition-colors",
  save:
    "inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors",
};

export const inputStyles =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

export const cardStyles = {
  base: "bg-white rounded-xl border border-gray-200 p-5",
  section: "bg-white rounded-xl border border-gray-200 p-5",
  header: "text-sm font-bold text-gray-700 mb-3 flex items-center gap-2",
};

export const labelStyles = {
  field: "text-xs text-gray-500 mb-1 block",
  item: "border border-gray-100 rounded-lg p-3 bg-gray-50 overflow-x-auto",
  preview: "bg-white rounded-xl border-2 border-gray-800 p-4 mb-3",
  previewTitle: "text-center font-bold text-sm border-b-2 border-gray-800 pb-2 mb-3",
  previewRow: "flex text-sm",
  previewLabel: "font-bold w-16 shrink-0",
  badge: "text-xs font-medium px-1.5 py-0.5 rounded",
  copyIndicator: "text-xs text-gray-400",
};

export const badgeStyles = {
  base: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
  success: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
  warning: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800",
  danger: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800",
  info: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
  neutral: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700",
  purple: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800",
};

export const tableStyles = {
  wrapper: "bg-white rounded-xl border border-gray-200 overflow-hidden",
  scroll: "overflow-x-auto",
  base: "w-full text-sm",
  header: "bg-gray-50 border-b border-gray-200",
  headCell: "text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wider",
  body: "divide-y divide-gray-100",
  row: "hover:bg-gray-50 transition-colors",
  cell: "px-4 py-3",
};
