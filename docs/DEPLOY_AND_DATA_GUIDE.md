# Web 项目发布与数据访问指南

> **当前正式线上：Netlify** → https://my-tongtong.netlify.app （国内不用翻墙可直连）
> **日常更新只需 `git push` 到 `main`，Netlify 自动构建上线，约 1 分钟。**
> 完整 Netlify 部署与快速更新说明见下方 **第一(七)节：国内访问不稳：已迁移到 Netlify**。
> 下面的 Vercel 章节是早期部署记录，Vercel 站点保留作备用/对照，国内访问不稳，不再作为主线。

这份文档用于把一个 Next.js/React Web 项目发布到线上（早期用 Vercel，现已迁到 Netlify），并连接 Supabase Postgres 存储数据。适合游戏排行榜、用户反馈、表单提交、轻量业务记录等场景。

## 推荐架构

```text
浏览器
  -> Vercel 页面 / CDN
  -> Next.js API Route
  -> Supabase Postgres / Storage
```

原则：

- Vercel 负责部署页面和 API。
- Supabase 负责数据库和录音文件存储。
- 前端不要把敏感密钥写进代码。
- 写数据优先走 `/api/*`，便于校验、防刷和后续换库。

## 一、发布页面到 Vercel

### 1. 当前项目仓库信息

当前项目已经上传到 GitHub：

```text
git@github.com:jy1981/hanppy_birthday.git
```

GitHub 页面地址：

```text
https://github.com/jy1981/hanppy_birthday
```

本地仓库当前 remote：

```bash
git remote -v
```

应该看到：

```text
origin  git@github.com:jy1981/hanppy_birthday.git (fetch)
origin  git@github.com:jy1981/hanppy_birthday.git (push)
```

后续改完代码后，按这个流程推送：

```bash
git status
git add .
git commit -m "你的提交说明"
git push
```

如果 push 提示 SSH 权限问题，先确认本机 SSH key 已加到 GitHub，并执行：

```bash
ssh-add ~/.ssh/id_ed25519
ssh -T git@github.com
```

看到类似 `Hi jy1981! You've successfully authenticated` 即表示 GitHub SSH 登录正常。

### 2. 准备代码仓库

把项目推到 GitHub。建议先确认本地能通过：

```bash
npm install
npm run typecheck
npm run build
```

常见 `package.json` 脚本：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

### 3. Vercel 怎么登录

推荐先用网页登录：

1. 打开 https://vercel.com/login
2. 选择 `Continue with GitHub`
3. 授权 Vercel 访问 GitHub
4. 如果授权范围可选，至少允许访问 `jy1981/hanppy_birthday`

如果要用命令行登录，可以在项目目录执行：

```bash
npx --yes --registry=https://registry.npmjs.org vercel@latest login
```

新版 Vercel CLI 使用 Device Flow，流程是：

1. 终端会显示一个登录网址和一串验证码。
2. 打开终端提示的网址。
3. 如果网页还没登录 Vercel，先选择 `Continue with GitHub` 登录。
4. 网页会显示本次 CLI 登录请求，核对验证码、位置、IP、请求时间。
5. 确认是自己当前这台机器发起的请求后，点击 `Approve` / `Authorize`。
6. 回到终端，看到登录成功提示即可。

注意：

- 不要批准陌生地点、陌生 IP、陌生时间发起的登录请求。
- 旧的邮箱参数登录、`--github`、`--gitlab` 等方式已经被 Vercel 标记为废弃。
- 当前环境默认 npm 源是 `https://bnpm.byted.org`，直接执行 `npx vercel@latest login` 可能会失败：

```text
npm error notarget No matching version found for @vercel/container@0.0.4
```

这是内部 npm 源没有同步完整 Vercel 依赖，不是项目代码问题。遇到这个错误就临时指定官方 npm 源：

```bash
npx --yes --registry=https://registry.npmjs.org vercel@latest login
```

验证 CLI 是否登录成功：

```bash
npx --yes --registry=https://registry.npmjs.org vercel@latest whoami
```

如果能输出账号名，说明 CLI 已登录。当前机器之前未登录时会报：

```text
No existing credentials found. Please run `vercel login` or pass "--token"
```

这种情况按上面的 `npx --yes --registry=https://registry.npmjs.org vercel@latest login` 重新登录即可。

### 4. 在 Vercel 导入项目

1. 打开 https://vercel.com
2. 使用 GitHub 登录
3. 点击 `Add New...` -> `Project`
4. 选择 `jy1981/hanppy_birthday`
5. Framework Preset 选择 `Next.js`
6. Build Command 通常保持 `npm run build`
7. Output Directory 通常留空
8. 点击 `Deploy`

部署完成后，Vercel 会给一个类似下面的访问地址：

```text
https://your-project.vercel.app
```

如果 Vercel 允许选择 Project Name，彤彤生日站建议使用：

```text
my_tontong
```

如果下划线不被接受，可以改成：

```text
my-tontong
```

### 5. 后续更新

之后每次 push 到 GitHub 默认分支，Vercel 会自动重新部署。

如果有预览分支，Vercel 会给每个 PR/分支生成 Preview URL。

### 6. 本项目实际部署记录

当前本地 GitHub 仓库：

```text
https://github.com/jy1981/hanppy_birthday
```

当前 Vercel 登录账号：

```text
jy1981
```

验证命令：

```bash
npx --yes --registry=https://registry.npmjs.org vercel@latest whoami
```

当前默认链接的 Vercel 项目：

```text
Project Name: my-tongtong
Project ID: prj_D3QwQcouuRf3sYiK9TNSuDApVayj
Scope: jy1981s-projects
```

本地 `.vercel/project.json` 记录的是 `my-tongtong`。`.vercel`、`.env.local`、`.env*` 已加入 `.gitignore`，不要提交这些本地部署文件。

历史上也创建过一个项目：

```text
Project Name: my_tongtong
Project ID: prj_PkGpx7JKcGJMK4mdbGNpg8S3uMu2
```

`my_tongtong` 是按最初希望的下划线命名创建的，但部署后的 `.vercel.app` 访问同样返回 `404 NOT_FOUND`，因此后续改用更标准的 `my-tongtong`。

当前 `my-tongtong` 最近一次生产部署：

```text
Deployment ID: dpl_2hdYNBcH5skL1fZmBdWxgvmkBqsY
Deployment URL: https://my-tongtong-9uv7o84bf-jy1981s-projects.vercel.app
Production Alias: https://my-tongtong.vercel.app
Ready State: READY
```

当前 alias 列表里能看到：

```text
my-tongtong-9uv7o84bf-jy1981s-projects.vercel.app -> my-tongtong.vercel.app
my-tongtong-9uv7o84bf-jy1981s-projects.vercel.app -> my-tongtong-jy1981s-projects.vercel.app
my-tongtong-9uv7o84bf-jy1981s-projects.vercel.app -> my-tongtong-jy1981-jy1981s-projects.vercel.app
```

部署命令：

```bash
npx --yes --registry=https://registry.npmjs.org vercel@latest deploy --prod --yes --project my-tongtong --force
```

部署过程中遇到过内部 npm 源问题，已通过以下方式处理：

- `package-lock.json` 中的 `resolved` 下载地址已统一换成 `https://registry.npmjs.org/`。
- 部署命令里的 Vercel CLI 也统一使用官方 npm 源。
- `.gitignore` 已忽略 `.vercel` 和 `.env*`。

Vercel 项目保护状态：

```json
{
  "name": "my-tongtong",
  "ssoProtection": null,
  "gitForkProtection": true
}
```

已执行过关闭 SSO Deployment Protection：

```bash
npx --yes --registry=https://registry.npmjs.org vercel@latest project protection disable my-tongtong --sso
```

当前状态（已解决）：

- 公网访问 `https://my-tongtong.vercel.app` 已恢复正常，首页与 `/api/wish` 均返回 `200`。
- 生产环境已配置 6 个 Supabase 变量（见第五节），线上 `/api/wish` 返回 `storageMode: "supabase"`，录音、每年一愿拦截、历史列表、密码校验、删除全链路线上实测通过。

历史上曾出现过的 404（现已不再复现）：

- Vercel `inspect` 显示部署 `READY`、构建日志有 `/` 和 `/api/wish`，但公网访问一度返回 `HTTP/2 404 / x-vercel-error: NOT_FOUND`。
- 通过重新执行 `vercel deploy --prod` 并配好生产环境变量后恢复正常。

验证命令：

```bash
curl -I -L https://my-tongtong.vercel.app
curl -sS https://my-tongtong.vercel.app/api/wish
npx --yes --registry=https://registry.npmjs.org vercel@latest inspect https://my-tongtong.vercel.app --format=json
```

如果将来再次出现 404，优先看：

- Vercel Dashboard 里 `my-tongtong -> Settings -> Domains` 是否显示 alias 正常绑定。
- Vercel Dashboard 里 `my-tongtong -> Settings -> Deployment Protection` 是否还有团队级保护或项目级保护。
- Vercel Dashboard 里 `my-tongtong -> Deployments -> Latest Deployment` 的 Functions / Output 是否能看到 `index` 和 `/api/wish`。
- 如果 Dashboard 里也 404，建议删除 `my_tongtong` 和 `my-tongtong` 两个项目，直接从 GitHub 仓库 `jy1981/hanppy_birthday` 重新 Import Project，而不是 CLI 手工 `project add`。

### 7. 国内访问不稳：已迁移到 Netlify（当前正式线上）

`*.vercel.app` 在国内经常被 DNS 污染、边缘节点也不稳定，不翻墙容易打不开。原计划迁 Zeabur，但 Zeabur 自 2026-03-15 起对新项目取消了免费共享集群（现在必须先买 VPS），所以最终改用 **Netlify**：对 Next.js（App Router + API Routes + SSR）原生支持、GitHub 一键部署、真免费、无需买服务器。

**当前正式线上地址（国内实测可直连、不用翻墙）：**

```text
https://my-tongtong.netlify.app
```

- Netlify 项目名：`my-tongtong`
- 团队：`jyan`（账号 yj_3000@163.com）
- 来源仓库：`github.com/jy1981/hanppy_birthday`，分支 `main`
- 运行时：Next.js Runtime（Netlify 自动识别，无需写 Dockerfile）
- Vercel 项目 `my-tongtong.vercel.app` 保留作为备用/对照，不影响 Netlify。

#### 7.1 首次部署做过的事（存档，重装不用重复看）

1. https://app.netlify.com 用 GitHub 登录 → `Add new project` / `Import an existing project` → 选仓库 `jy1981/hanppy_birthday`。
2. Netlify 自动识别 Next.js，构建配置保持默认即可：
   - Build command：`npm run build`
   - Publish directory：`.next`
   - Branch to deploy：`main`
3. 展开 `Add environment variables` → `Import from a .env file`，一次性粘入下面 8 行（见 7.2）。
4. 点 `Deploy`。

#### 7.2 环境变量（Netlify 需要的完整 10 项）

在 Netlify `Project configuration -> Environment variables` 里配置。值统一以本机 `.env.local` 为准（**不要提交到 Git**）。注意最后一项 `SECRETS_SCAN_ENABLED`，是 Vercel 没有、Netlify 特有的：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
WISH_STORAGE_MODE=supabase
SUPABASE_WISH_TABLE=birthday_wishes
SUPABASE_WISH_BUCKET=birthday-wishes
SUPABASE_IMAGE_TABLE=birthday_images
SUPABASE_IMAGE_BUCKET=birthday-images
WISH_ADMIN_PASSWORD
SECRETS_SCAN_ENABLED=false
```

**为什么必须加 `SECRETS_SCAN_ENABLED=false`（这是首次部署踩的唯一坑）：**

Netlify 构建时会做"密钥扫描"，把出现在构建产物里的环境变量值当成"泄露的密钥"而让构建失败（exit code 2，报 `Exposed secrets detected`）。但本项目里：

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 按 Next.js 设计**本来就要打进前端**，出现在产物里是正常的；
- `WISH_STORAGE_MODE=supabase`、`SUPABASE_WISH_TABLE=birthday_wishes`、`SUPABASE_WISH_BUCKET=birthday-wishes` 这些只是**普通配置字符串**（代码里还有同名默认值），被扫描器误判。

真正敏感的 `SUPABASE_SERVICE_ROLE_KEY` 和 `WISH_ADMIN_PASSWORD` 只在服务端使用，不会进前端 bundle。所以直接用 `SECRETS_SCAN_ENABLED=false` 关掉这个过度敏感的扫描是安全的。（若想更精细，也可改用 `SECRETS_SCAN_OMIT_KEYS` 只豁免特定 key，但本项目直接整体关闭更省事。）

#### 7.3 以后如何"快速更新部署"（日常最常用，记这一条就够）

Netlify 已经和 GitHub `main` 分支绑定了自动部署，所以更新代码只要照常推送即可：

```bash
git status
git add <改动的文件>
git commit -m "你的提交说明"
git push
```

`git push` 到 `main` 之后，Netlify 会自动拉取、构建、上线，约 1 分钟。**不需要动 Netlify 网页，也不需要跑任何 Netlify 命令。**

其它常见操作（都在 Netlify 网页上点）：

- **看部署进度/日志**：`Deploys` 页 → 点最新一条部署 → 看 `Deploy log`。绿色 `Published` 即成功。
- **不改代码、只想重新构建一次**（比如改了环境变量后要生效）：`Deploys` 页右上 `Trigger deploy` → `Deploy project`（或 `Deploy project without cache` 做干净重建）。
- **改环境变量**：`Project configuration -> Environment variables` 改完后，务必按上一条 `Trigger deploy` 重新部署一次才会生效。
- **回滚到上一个好版本**：`Deploys` 页找到之前成功的那条 → `Publish deploy`。

#### 7.4 每次上线后的自检命令

把域名保持为 `my-tongtong.netlify.app` 即可直接用：

```bash
# 1. 首页应为 200
curl -s -o /dev/null -w "%{http_code}\n" -L https://my-tongtong.netlify.app/

# 2. 应返回 "storageMode":"supabase"（确认连的是云端库，不是本地降级）
curl -sS https://my-tongtong.netlify.app/api/wish

# 3. 后台错误密码应为 403（确认鉴权正常）
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://my-tongtong.netlify.app/api/wish/admin \
  -H "Content-Type: application/json" -d '{"password":"错误密码"}'
```

当前实测结果（2026-07 首次上线）：首页 `200`、`/api/wish` 返回 `storageMode":"supabase"`、后台错误密码 `403`，全部通过。

注意：

- 录音播放走的是 Supabase 签名 URL（`*.supabase.co`），由用户浏览器直连，与托管平台无关。若国内播放慢属于 Supabase 链路问题，可后续单独优化（如加国内 CDN 中转）。
- 想更彻底稳定，可在 Netlify `Domain management` 绑自定义域名 + 国内 CDN（需备案）。目前 `*.netlify.app` 实测已可直连，暂不需要。

## 二、申请 Supabase 数据库

### 1. 创建项目

1. 打开 https://supabase.com
2. 登录后点击 `New project`
3. 填项目名和数据库密码
4. Region 尽量选择和 Vercel 用户访问区域接近的位置
5. 等待项目初始化完成

### 2. 获取连接信息

进入 Supabase 项目：

```text
Project Settings -> API
```

需要这几个值：

```text
Project URL
anon public key
service_role key
```

注意：

- `anon public key` 可以用于浏览器端，但仍要配合 RLS 策略。
- `service_role key` 只能放服务端环境变量，绝不能写进前端代码。

## 三、建表示例

比如要存游戏分数，可以在 Supabase 的 `SQL Editor` 执行：

```sql
create table if not exists game_scores (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  player_name text not null,
  score integer not null,
  duration_seconds integer,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_scores_game_score_idx
  on game_scores (game, score desc, created_at desc);
```

如果只是测试，可以先不开复杂权限，数据访问全部走服务端 API。正式上线前建议开启 RLS 并按业务收紧策略。

### 2026 彤彤生日录音表

当前项目的录音愿望功能走 `/api/wish`，录音文件放 Supabase Storage，密码哈希和文件元数据放 Postgres。前端不会接触 `service_role key`。

在 Supabase `SQL Editor` 执行：

```sql
create table if not exists birthday_wishes (
  id uuid primary key default gen_random_uuid(),
  password_hash text not null,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists birthday_wishes_created_at_idx
  on birthday_wishes (created_at desc);

alter table birthday_wishes enable row level security;
```

录音表不需要开放匿名读写，因为项目使用服务端 API 和 `SUPABASE_SERVICE_ROLE_KEY` 访问。

再到 `Storage` 创建一个私有 bucket：

```text
birthday-wishes
```

注意保持 bucket 为 private。播放录音时，服务端会在密码验证通过后生成 30 分钟有效的签名 URL。

### 2026 彤彤生日相册表（照片上传，新增）

相册功能走 `/api/image`，和录音完全对称：照片文件放 Supabase Storage，密码哈希和元数据放 Postgres。名额与录音各自独立（每年录音一条、照片一张互不影响），但**共用同一个全站唯一密码**（取愿望表与相册表中最早创建那条记录的密码哈希，首次设置后不可改）。

在 Supabase `SQL Editor` 执行（结构与 `birthday_wishes` 一致，仅表名不同）：

```sql
create table if not exists birthday_images (
  id uuid primary key default gen_random_uuid(),
  password_hash text not null,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists birthday_images_created_at_idx
  on birthday_images (created_at desc);

alter table birthday_images enable row level security;
```

相册表同样不需要开放匿名读写，全部走服务端 API + `SUPABASE_SERVICE_ROLE_KEY`。

再到 `Storage` 创建一个私有 bucket：

```text
birthday-images
```

保持 private。查看照片时，服务端在密码验证通过后生成 30 分钟有效的签名 URL（和录音相同机制）。

## 四、项目里安装 Supabase SDK

```bash
npm install @supabase/supabase-js
```

## 五、配置环境变量

本地创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
WISH_STORAGE_MODE=supabase
SUPABASE_WISH_TABLE=birthday_wishes
SUPABASE_WISH_BUCKET=birthday-wishes
SUPABASE_IMAGE_TABLE=birthday_images
SUPABASE_IMAGE_BUCKET=birthday-images
```

在 Vercel 后台也要配置同样的变量：

```text
Vercel Project -> Settings -> Environment Variables
```

建议：

- `NEXT_PUBLIC_SUPABASE_URL`：Production / Preview / Development 都填。
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Production / Preview / Development 都填。
- `SUPABASE_SERVICE_ROLE_KEY`：只给服务端使用，不要在浏览器代码里引用。
- `WISH_STORAGE_MODE`：线上填 `supabase`，本地没配 Supabase 时可以不填，会回退到本地 `public/wishes`。
- `SUPABASE_WISH_TABLE` / `SUPABASE_WISH_BUCKET`：如果沿用默认名，可以不填；为了上线排查清楚，建议显式配置。

## 六、推荐方式：通过 API 访问数据

这种方式更稳，适合排行榜、表单、订单、评论、用户行为记录。

### 1. 服务端 Supabase Client

新建：

```text
src/lib/supabase/server.ts
```

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server environment variables.");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});
```

### 2. 写入分数 API

新建：

```text
src/app/api/scores/route.ts
```

```ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function cleanName(value: unknown): string {
  if (typeof value !== "string") return "anonymous";
  return value.trim().replace(/\s+/g, " ").slice(0, 32) || "anonymous";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const game = typeof body?.game === "string" ? body.game.slice(0, 40) : "";
  const playerName = cleanName(body?.playerName);
  const score = Number(body?.score);
  const durationSeconds =
    body?.durationSeconds == null ? null : Number(body.durationSeconds);

  if (!game || !Number.isInteger(score) || score < 0) {
    return NextResponse.json({ error: "Invalid score payload." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("game_scores")
    .insert({
      game,
      player_name: playerName,
      score,
      duration_seconds:
        Number.isFinite(durationSeconds) && durationSeconds >= 0
          ? Math.round(durationSeconds)
          : null,
    })
    .select("id, game, player_name, score, duration_seconds, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save score." }, { status: 500 });
  }

  return NextResponse.json({ score: data });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);

  if (!game) {
    return NextResponse.json({ error: "Missing game." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("game_scores")
    .select("id, game, player_name, score, duration_seconds, created_at")
    .eq("game", game)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Failed to load scores." }, { status: 500 });
  }

  return NextResponse.json({ scores: data });
}
```

### 3. 前端提交数据

```ts
async function submitScore() {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game: "minesweeper",
      playerName: "test",
      score: 1200,
      durationSeconds: 45,
    }),
  });

  if (!response.ok) {
    throw new Error("Submit score failed.");
  }

  return response.json();
}
```

### 4. 前端读取排行榜

```ts
async function loadScores() {
  const response = await fetch("/api/scores?game=minesweeper&limit=10");

  if (!response.ok) {
    throw new Error("Load scores failed.");
  }

  const result = await response.json();
  return result.scores;
}
```

## 七、最快方式：前端直连 Supabase

这种方式适合原型验证。正式项目更推荐 API 中转。

```text
src/lib/supabase/client.ts
```

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

插入：

```ts
await supabase.from("game_scores").insert({
  game: "minesweeper",
  player_name: "test",
  score: 1200,
  duration_seconds: 45,
});
```

读取：

```ts
const { data, error } = await supabase
  .from("game_scores")
  .select("*")
  .eq("game", "minesweeper")
  .order("score", { ascending: false })
  .limit(10);
```

如果使用前端直连，必须配置 RLS 策略，否则要么访问被拒绝，要么数据暴露过多。

## 八、RLS 基础策略

如果要允许匿名用户读取排行榜、提交分数，可以这样做一个基础策略：

```sql
alter table game_scores enable row level security;

create policy "Public can read scores"
on game_scores
for select
to anon
using (true);

create policy "Public can insert scores"
on game_scores
for insert
to anon
with check (
  game <> ''
  and player_name <> ''
  and score >= 0
);
```

注意：匿名 insert 容易被刷。正式项目建议写入走 API，并在 API 里做限流、验证码、签名或登录校验。

## 九、本地测试流程

1. 启动开发服务：

```bash
npm run dev
```

2. 打开：

```text
http://localhost:3000
```

3. 调用 API 测试写入：

```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"game":"minesweeper","playerName":"local","score":100,"durationSeconds":30}'
```

4. 测试读取：

```bash
curl "http://localhost:3000/api/scores?game=minesweeper&limit=10"
```

5. 去 Supabase 表编辑器确认数据是否写入。

### 录音愿望测试

本地如果已经配置 Supabase 环境变量：

```bash
npm run dev
```

打开页面进入终章录音。录制完成后检查：

- `Storage -> birthday-wishes` 里有 `wishes/YYYY-MM-DD/*.webm` 或 `.m4a` 文件。
- `Table Editor -> birthday_wishes` 有一条元数据记录。
- 关闭弹窗后再次打开，页面应进入密码解锁态。

如果没有配置 Supabase，本地会使用 `public/wishes` 做开发回退；这个模式只适合本地验证，不适合 Vercel 上线。

## 十、上线检查表

- `npm run typecheck` 通过。
- `npm run build` 通过。
- Vercel 环境变量已配置。
- Supabase 表已创建。
- Supabase `birthday-wishes` 私有 bucket 已创建。
- Supabase `birthday_images` 表 + `birthday-images` 私有 bucket 已创建（相册功能）。
- 如果前端直连，RLS 策略已配置。
- 如果 API 中转，`service_role key` 只存在 Vercel 环境变量里。
- 线上 `WISH_STORAGE_MODE=supabase`。
- 不要把 `.env.local` 提交到 Git。
- 不要在前端代码里使用 `SUPABASE_SERVICE_ROLE_KEY`。
- 写库频率要低，只在提交表单、游戏结束、保存进度等关键节点写入。

## 十一、常见问题

### Vercel 部署成功，但接口报 500

优先检查：

- Vercel 是否配置了环境变量。
- 环境变量是否选择了 Production。
- Supabase 表名和字段名是否一致。
- `SUPABASE_SERVICE_ROLE_KEY` 是否填错。

### 本地能访问，线上不能访问

通常是 Vercel 环境变量没配，或者只配到了 Preview/Development，没有配到 Production。

### 数据写入很慢

检查：

- Vercel 和 Supabase region 是否距离过远。
- 是否每次点击都写数据库。
- 是否一次查询返回了过多数据。

### 要不要把数据存在 Vercel 项目文件里

不要。Vercel 的运行环境不适合持久化写文件。持久数据应该放数据库或对象存储。
