import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 宣纸胭脂（日间温柔）
        paper: '#F5EDE0',
        paperSoft: '#FBF6EC',
        rouge: '#B03A48',
        rougeSoft: '#E4C6D0',
        dai: '#426666',
        gold: '#C9A368',
        ink: '#1F1B1A',
        mist: '#7A7A7A',
        // 黛色月夜（终章夜色）
        night: '#0F1B2A',
        nightDeep: '#080E18',
        plum: '#3D2B4A',
        moon: '#D6ECF0',
        liujin: '#D4A656',
      },
      fontFamily: {
        kai: ['var(--font-kai)', 'LXGW WenKai', 'KaiTi', 'serif'],
        song: ['var(--font-song)', 'Noto Serif SC', 'Songti SC', 'serif'],
        hei: ['var(--font-hei)', 'Noto Sans SC', 'PingFang SC', 'sans-serif'],
        hand: ['var(--font-hand)', 'Ma Shan Zheng', 'cursive'],
        en: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease forwards',
        'lantern-sway': 'lanternSway 4s ease-in-out infinite',
        'ink-spread': 'inkSpread 1.6s ease-out forwards',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        lanternSway: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        inkSpread: {
          '0%': { transform: 'scale(0.2)', opacity: '0' },
          '60%': { opacity: '0.8' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
