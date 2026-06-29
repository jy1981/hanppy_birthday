/**
 * 媒体与文案清单。把素材投到 public/media/... ，把照片名字登记在 photos
 * 里就能自动渲染；缺图时占位框会优雅显示。
 */

export type Photo = {
  src: string;
  alt?: string;
  ratio?: 'portrait' | 'landscape' | 'square';
};

export type ChapterMedia = {
  cover?: Photo[];
  meet?: Photo[];
  wedding?: Photo[];
  baby?: Photo[];
  travel?: Photo[];
  birthday?: Photo[];
};

/** 家庭里的三个人 —— 关键日期 */
export const family = {
  papa: { name: '先生', birthday: '1981.01.17', zodiac: '酉鸡' },
  mama: { name: '彤彤', birthday: '1988.07.06', zodiac: '辰龙' },
  baby: { name: '小宝', birthday: '2025.04.15', zodiac: '乙巳蛇' },
} as const;

/** 重要纪念日 */
export const milestones = {
  anniversary: '2024.06.13', // 结婚
  babyBirth: '2025.04.15', // 宝宝降生
  herBirthday: '2026.07.06', // 这次的主角：彤彤生日
} as const;

/** 在此填写真实文件名即可加载；留空数组就是优雅占位 */
export const photos: ChapterMedia = {
  cover: [
    // { src: '/media/photos/cover/01.jpg', alt: '封面合照', ratio: 'portrait' },
  ],
  meet: [],
  wedding: [],
  baby: [
    // 宝宝小手 / 三人合照 / 妈妈抱宝宝
  ],
  travel: [],
  birthday: [],
};

/** 视频路径，缺失时静默隐藏 */
export const videos = {
  hero: '/media/videos/hero.mp4',
  inkTransition: '/media/videos/transitions/ink.mp4',
  finaleFireworks: '/media/videos/finale-fireworks.mp4',
  birthdayPortrait: '/media/videos/birthday-portrait.mp4',
} as const;

/** 背景音乐 */
export const audio = {
  bgm: '/media/audio/bgm.mp3',
} as const;

/**
 * 文案 —— 全部集中在这里，方便单点修改。
 * 注意：letter 数组里每个元素是一行；空字符串 = 段落分隔。
 */
export const copy = {
  her: family.mama.name,

  cover: {
    eyebrow: '致 我最爱的',
    title: '彤 彤',
    subtitle: '二〇二六 · 夏',
    prompt: '长按 · 推开门',
  },

  prelude: {
    poem: '执子之手 · 与子偕老',
    sub: '愿这卷轴之后，是我们走过的两年，\n与你永远十八岁的夏天。',
  },

  meet: {
    eyebrow: '— Chapter I · 初见 —',
    title: '初见',
    poem: '山有木兮木有枝\n心悦君兮君不知',
    body: '那一年，你走进我的世界，\n从此四季都温柔。',
  },

  wedding: {
    eyebrow: '— Chapter II · 永结 —',
    title: '永结',
    date: '陆月拾叁',
    dateSub: `${milestones.anniversary.replace(/\./g, ' · ')}`,
    vow: '愿得一心人，白首不相离。',
    body: '两年前的今天，\n我们牵着手，把余生写进了同一页。',
  },

  baby: {
    eyebrow: '— Chapter III · 初啼 —',
    title: '初啼',
    date: '肆月拾伍',
    dateSub: `${milestones.babyBirth.replace(/\./g, ' · ')}`,
    tag: '为人父母 · 元年',
    body:
      '那一个清晨，\n一个全新的小生命，\n被这个世界温柔地交到我们手里。\n小小一团，软软地哭。',
    sub:
      '我看着你抱着 ta 的样子，\n突然懂了什么叫——\n「心都化了」。\n你从此 不只是我的爱人，\n也是 ta 心里最温柔的整个世界。',
    fatherNote: '——写在为人父的第一年',
  },

  together: {
    eyebrow: '— Chapter IV · 日常 —',
    title: '日常',
    sub: '我们仨 · 慢慢走过的那些时光',
    places: ['北京', '苏州', '大理', '京都', '长沙', '厦门'],
    poem:
      '走过的每一条街，\n抱过的每一个清晨，\n都因为有你和 ta，\n成了我心底的诗。',
  },

  birthday: {
    eyebrow: '— Chapter V · 彤 · 芳华 —',
    title: '彤',
    date: '柒月初陆',
    dateSub: `${milestones.herBirthday.replace(/\./g, ' · ')}`,
    age: '永远十八',
    body:
      '彤，是日出时天边最暖的那抹红。\n是你笑起来的脸颊，\n是宝宝望向你时的眼睛。\n\n这是你成为妈妈之后的——\n又一个 被爱着 的 生 日。',
    letterLead: '——一封写给你的小信——',
    letter: [
      '彤彤：',
      '',
      '认识你之前，我以为人生就是一场漫长的赶路；',
      '认识你之后，我才知道，',
      '人生原来可以慢下来，可以有人陪着一起看风景。',
      '',
      '去年四月的那个清晨，',
      '我们的小朋友来到了这个世界。',
      '看着你成为妈妈的那一刻，',
      '我又重新爱了你一遍。',
      '',
      '谢谢你笑，谢谢你恼，',
      '谢谢你把我们的小家变得这样温柔。',
      '',
      '愿你永远十八岁这一年：',
      '想要的都拥有，得不到的都释怀；',
      '少一些熬夜带娃的疲惫，\n多一些被宠爱的清晨。\n\n岁月不会在你脸上留痕，\n因为你的笑，就是最好的逆生长。',
      '',
      '我和宝宝，会一直在你身边。',
      '',
      '生日快乐，我的爱人。',
      '——你的先生',
    ],
  },

  finale: {
    eyebrow: '— Finale · 来日方长 —',
    title: '来日方长',
    sub: '吹灭蜡烛 · 许个愿吧',
    wish: '愿我们仨的第三年、第十年、第五十年——\n仍然像今天一样，相视而笑。',
    seal: '与 彤 偕老',
    signature: `先生 · ${family.papa.birthday}  ·   彤 · ${family.mama.birthday}  ·  小宝 · ${family.baby.birthday}`,
  },
} as const;
