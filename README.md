# 致彤彤 · 二周年与生日纪念站

一个写给一个人的网站。

## 启动

```bash
npm install
npm run dev
```

打开 http://localhost:3000，建议用 Chrome 模拟 iPhone 14 Pro / 真机扫码看效果。

## 素材投放路径

把照片视频丢进对应文件夹即可，组件会自动按 `lib/manifest.ts` 中的清单加载：

```
public/media/
  photos/
    cover/        封面合照
    meet/         初见 / 恋爱
    wedding/      婚礼 6.13
    travel/       旅行 / 同游
    birthday/     生日 / 她
  videos/
    hero.mp4              首屏环境视频（9:16，10-15s 循环，静音）
    transitions/ink.mp4   水墨转场
    finale-fireworks.mp4  终章烟花
  audio/
    bgm.mp3       背景音乐
```

视频建议：竖屏 1080×1920，H.264，单段 < 10MB。
图片建议：竖向构图，长边 ≤ 1600px，每张 < 400KB（用 squoosh.app 压）。

## 章节
0. 封面 · 致彤彤
1. 序章 · 执手
2. 初见
3. 永结（6.13）
4. 同游
5. 生辰（7.6）· 彤彤
6. 来日方长

## 技术栈
Next.js 14 · TypeScript · Tailwind · GSAP + ScrollTrigger · Lenis · Framer Motion · Swiper · Howler
