import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 CSS 类名，处理 Tailwind 冲突。
 * shadcn/ui 的标准工具函数，所有组件依赖此函数。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
