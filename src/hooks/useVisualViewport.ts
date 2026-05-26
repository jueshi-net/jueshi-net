'use client';

import { useState, useEffect, useCallback } from 'react';

interface VisualViewportState {
  /** 软键盘弹起后的真实可用高度 */
  height: number;
  /** 软键盘弹起后的真实可用宽度 */
  width: number;
  /** 软键盘弹起后的 Y 偏移量 (≈ 键盘高度) */
  offsetTop: number;
  /** 缩放比例 */
  scale: number;
  /** 是否检测到 visualViewport API (iOS 13+ / Chrome 79+) */
  isSupported: boolean;
  /** 软键盘是否弹起 (offsetTop > 0) */
  isKeyboardOpen: boolean;
}

/**
 * 移动端软键盘感知 Hook
 *
 * 调用浏览器 window.visualViewport API，实时监听并计算软键盘弹起后的
 * 真实可用高度，为后续重构 CmdK 弹层和 Bottom Sheet 抽屉提供基础数据。
 *
 * 使用场景：
 * - CmdK 搜索框弹层高度自适应
 * - Bottom Sheet 抽屉避开键盘区域
 * - 固定底部导航栏在键盘弹起时隐藏
 *
 * @example
 * ```tsx
 * const { height, isKeyboardOpen } = useVisualViewport();
 * const bottomSheetStyle = {
 *   maxHeight: isKeyboardOpen ? `${height - 40}px` : '80vh',
 * };
 * ```
 */
export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(() => {
    const vp = typeof window !== 'undefined' ? window.visualViewport : null;
    const isSupported = !!vp;

    return {
      height: isSupported ? vp!.height : (typeof window !== 'undefined' ? window.innerHeight : 0),
      width: isSupported ? vp!.width : (typeof window !== 'undefined' ? window.innerWidth : 0),
      offsetTop: isSupported ? vp!.offsetTop : 0,
      scale: isSupported ? vp!.scale : 1,
      isSupported,
      isKeyboardOpen: false,
    };
  });

  const handleResize = useCallback(() => {
    const vp = window.visualViewport;
    if (!vp) return;

    const offsetTop = Math.round(vp.offsetTop);
    const isKeyboardOpen = offsetTop > 10; // 10px tolerance for scroll bounce

    setState({
      height: Math.round(vp.height),
      width: Math.round(vp.width),
      offsetTop,
      scale: vp.scale,
      isSupported: true,
      isKeyboardOpen,
    });
  }, []);

  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;

    // Initial read
    handleResize();

    // Listen for resize (keyboard open/close triggers this)
    vp.addEventListener('resize', handleResize);
    // Also listen for scroll (some browsers fire scroll instead)
    vp.addEventListener('scroll', handleResize);

    return () => {
      vp.removeEventListener('resize', handleResize);
      vp.removeEventListener('scroll', handleResize);
    };
  }, [handleResize]);

  // Fallback: also listen to window resize for browsers without visualViewport
  useEffect(() => {
    if (state.isSupported) return;

    const handleWindowResize = () => {
      setState((prev) => ({
        ...prev,
        height: window.innerHeight,
        width: window.innerWidth,
      }));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [state.isSupported]);

  return state;
}

export default useVisualViewport;
