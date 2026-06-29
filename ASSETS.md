# 素材下载清单

> 把下载好的素材放到 `public/media/` 对应目录下，然后在 `lib/manifest.ts` 里登记文件名即可。

---

## 一、照片（必填）

所有照片建议宽度 ≥ 1200px，竖图比例 3:4，横图比例 16:9。

| 章节 | 路径 | 张数 | 说明 |
|------|------|------|------|
| 封面 | `public/media/photos/cover/` | 1 | 两人合照，竖图，用于首屏主视觉 |
| 初见 | `public/media/photos/meet/` | 2-3 | 早期合照 / 聊天截图 / 第一次约会等 |
| 永结 | `public/media/photos/wedding/` | 3-4 | 婚礼现场照片，含仪式、敬酒、合影 |
| 初啼 | `public/media/photos/baby/` | 2-3 | 宝宝小手、三人合照、妈妈抱宝宝 |
| 日常 | `public/media/photos/travel/` | 4-6 | 旅行、日常生活的随手拍 |
| 生日 | `public/media/photos/birthday/` | 3 | 彤彤的特写 / 笑容 / 今年生日照 |

### 推荐图库（免费可商用）

- **Unsplash** — https://unsplash.com （搜索关键词：chinese wedding, couple, baby hands, birthday cake）
- **Pexels** — https://www.pexels.com （搜索关键词：romantic, family, candlelight）
- **Pixabay** — https://pixabay.com

> 如果暂时没有真实照片，占位框会优雅显示文字标签，不影响整体效果。

---

## 二、视频（选填，但强烈建议）

| 用途 | 路径 | 说明 |
|------|------|------|
| 封面背景 | `public/media/videos/hero.mp4` | 15-30s 暖色调氛围视频，如花瓣飘落、光斑、水墨晕染 |
| 水墨转场 | `public/media/videos/transitions/ink.mp4` | 3-5s 水墨晕开素材，用于章节过渡 |
| 生日肖像 | `public/media/videos/birthday-portrait.mp4` | 彤彤的短视频 / 动态肖像，10-15s |
| 终章烟花 | `public/media/videos/finale-fireworks.mp4` | 15-30s 烟花/夜空素材 |

### 推荐视频素材站

- **Coverr** — https://coverr.co （免费可商用短视频）
- **Mixkit** — https://mixkit.co/free-stock-video/ （搜索：fireworks, ink, petals）
- **Videvo** — https://www.videvo.net

---

## 三、音频（必填 1 首）

| 用途 | 路径 | 说明 |
|------|------|------|
| 背景音乐 | `public/media/audio/bgm.mp3` | 全站 BGM，建议轻柔古风 / 钢琴曲，2-4 分钟 |

### 推荐音乐来源

- **Pixabay Music** — https://pixabay.com/music/ （搜索：chinese guzheng, piano romantic, ambient）
- **Free Music Archive** — https://freemusicarchive.org
- **耳聆网** — https://www.ear0.com （中文声音素材库）

> 推荐风格：古筝/钢琴轻音乐，BPM 60-80，无歌词或人声极轻。

---

## 四、纹理背景（选填，用于替换 CSS 渐变）

| 用途 | 建议路径 | 说明 |
|------|------|------|
| 宣纸纹理 | `public/media/textures/rice-paper.jpg` | 用于 `paper-texture` 背景，浅米色宣纸 |
| 暖宣纸 | `public/media/textures/rice-paper-warm.jpg` | 用于 `paper-texture-warm`，偏暖黄 |
| 夜色纹理 | `public/media/textures/night-sky.jpg` | 用于终章 `night-texture`，深蓝/墨色夜空 |

### 推荐纹理来源

- **Unsplash** 搜索：rice paper texture, parchment, dark sky
- **Texture Haven** — https://texturehaven.com
- 也可以用 CSS 生成（当前方案），有真实纹理会更有质感

---

## 五、装饰素材（选填，用于替换自绘 SVG）

| 用途 | 建议路径 | 说明 |
|------|------|------|
| 四角花纹 | `public/media/decor/floral-corner.svg` 或 `.png` | 工笔花卉角花，透明背景 |
| 水墨分隔线 | `public/media/decor/ink-brush.png` | 水墨笔触横线，透明背景 |
| 印章素材 | `public/media/decor/seal-red.png` | 红色篆刻印章，透明背景 |

### 推荐来源

- **阿里妈妈矢量库** — https://www.iconfont.cn （搜索：花纹，角花，印章）
- **千图网** — https://www.58pic.com （搜索：水墨笔触，工笔花卉）
- **Freepik** — https://www.freepik.com （搜索：chinese floral corner, ink brush stroke）

> 如果找到合适的装饰素材，替换对应组件中的 SVG 即可。当前自绘装饰已调低透明度，不替换也不影响整体观感。

---

## 六、快速上手

```bash
# 1. 创建目录
mkdir -p public/media/{photos/{cover,meet,wedding,baby,travel,birthday},videos/transitions,audio,textures,decor}

# 2. 把素材放进去，然后在 lib/manifest.ts 里登记文件名
#    例如：cover: [{ src: '/media/photos/cover/01.jpg', alt: '封面合照', ratio: 'portrait' }]

# 3. 启动开发服务器
npm run dev
```

---

## 当前状态

- [x] 所有照片留空 = 优雅占位框
- [x] 所有视频留空 = CSS 渐变兜底
- [x] 背景音乐留空 = 静默（按钮可点但无声）
- [x] 自绘装饰已调低透明度，不突兀
- [ ] 放入真实照片后效果最佳
- [ ] 放入 BGM 后沉浸感最强
