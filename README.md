# youtube-transcriber （RoboSub Crew）

多语言 YouTube 字幕转写与翻译（本地 Whisper + OpenAI 翻译）。/ YouTube transcription and multilingual translation (local Whisper + OpenAI).

---

## 功能 / Features

- 输入 YouTube 链接，一键下载音频、转写为原文字幕、并翻译为目标语言
- 句子视图与全文视图切换；点击句子可定位到视频/音频时间轴
- 支持仅音频模式（无视频时播放本地 `assets` 中的 mp3）
- 本地历史记录（浏览器内保存，可回看/删除）

- Enter a YouTube URL to download audio, transcribe it, and translate to target language
- Switch between sentence view and full text; click a sentence to seek to its timestamp
- Audio-only mode supported (plays local mp3 from `assets` when no video)
- Local history (stored in browser; revisit or delete)

---

## 前置依赖 / Prerequisites

本项目需要在本机安装以下工具（后端会调用它们）：

- Node.js 18+（Next.js 15）
- `yt-dlp`（下载并提取音频）
- `whisper.cpp` 可执行程序（命令名需为 `whisper`）与模型 `ggml-small.bin`
- OpenAI API Key（用于翻译）

macOS 示例 / macOS example：

```bash
brew install yt-dlp
# 如果 Homebrew 存在 whisper-cpp 配方，可直接：
# brew install whisper-cpp

# 若无配方，可从源码构建（参考官方仓库）
git clone https://github.com/ggerganov/whisper.cpp.git ~/whisper.cpp
cd ~/whisper.cpp && make

# 下载 small 模型（或手动放置）
mkdir -p ~/whisper.cpp/models
curl -L -o ~/whisper.cpp/models/ggml-small.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# 将可执行文件放到 PATH，并命名为 whisper（whisper.cpp 默认产物叫 main）
sudo ln -sf "$HOME/whisper.cpp/main" /usr/local/bin/whisper
```

注意：代码默认从 `~/whisper.cpp/models/ggml-small.bin` 读取模型，命令名是 `whisper`。如果你的路径或命令不同，请修改 `src/app/actions/transcribe.ts` 中的相应设置，或用软链统一。
Note: The code reads model from `~/whisper.cpp/models/ggml-small.bin` and expects the executable name `whisper`. Adjust paths or create symlinks if yours differ.

---

## 环境变量 / Environment variables

在项目根目录创建 `.env.local`（Next.js 会自动加载）：

```ini
OPENAI_API_KEY=你的OpenAIKey
```

`.env.local` 不应提交到版本库。

---

## 安装与启动 / Setup & Run

```bash
# 安装依赖 / Install dependencies
npm install

# 本地开发 / Local development
npm run dev

# 生产构建与启动 / Production build & start
npm run build
npm start
```

默认地址 `http://localhost:3000` / Default: `http://localhost:3000`.

---

## 使用方法 / Usage

1. 打开页面，输入 YouTube 链接（也可留空，仅音频模式）。
2. 选择目标语言（中文/英文/…）。
3. 点击「Transcribe」。等待下载 → 转写 → 翻译完成。
4. 在「视频」或「音频」模式下播放；在「按句」页签中点击某句可跳转到对应时间。
5. 历史记录会自动保存到本地，可在左上方列表中回看或删除。

6. Open the page and enter a YouTube URL (optional; audio-only works).
7. Choose the target language (Chinese/English/etc.).
8. Click "Transcribe". Wait for Download → Transcribe → Translate.
9. Play in Video or Audio mode; click a sentence to jump to the timestamp.
10. History is saved locally; revisit or delete from the list.

### 演示 / Demo

> GitHub README 不保证内嵌 `<video>` 显示，建议使用文件链接或 GIF。点击下方链接可在 GitHub 文件页面中播放。
> GitHub README does not reliably render inline `<video>`. Use file links or GIFs. Click links below to play on the file page.

- [Demo 1 — robosub1.mov](assets/demo/robosub1.mov)
- [Demo 2 — robosub2.mov](assets/demo/robosub2.mov)
- [Demo 3 — robosub3.mov](assets/demo/robosub3.mov)
- [Demo 4 — robosub4.mov](assets/demo/robosub4.mov)

如需在 README 中直接播放，建议将 `.mov` 转为更通用的 `.mp4` 并改用 GIF 缩略图链接：
To inline “play-like” content in README, convert `.mov` to widely compatible `.mp4` and use a GIF thumbnail link:

```md
[![Demo 1](assets/demo/demo1.gif)](assets/demo/robosub1.mp4)
```

---

## 文件与路由说明 / Files & Routing

- 音频与中间产物保存在项目根目录的 `assets` 目录。
- 通过 `GET /api/assets/...` 流式读取 `assets` 下的文件（范围请求支持）。
- 核心逻辑位于：

  - `src/app/actions/transcribe.ts`（下载音频 → 调用 `whisper` 输出 JSON→ 调用 OpenAI 翻译）
  - `src/app/page.tsx`（UI 交互、播放、标签页、历史缓存）

- Audio and intermediate artifacts are stored in the project root `assets` directory.
- Files under `assets` are streamed via `GET /api/assets/...` with HTTP Range support.
- Core logic:
  - `src/app/actions/transcribe.ts` (download audio → run `whisper` JSON → OpenAI translation)
  - `src/app/page.tsx` (UI interactions, playback, tabs, local history)

---

## 常见问题 / FAQ

- `whisper: command not found`
  - 请确认已将 `~/whisper.cpp/main` 软链为 `whisper` 并位于 PATH 中。
  - Ensure `~/whisper.cpp/main` is symlinked as `whisper` and available in PATH.
- `ggml-small.bin not found`
  - 确认模型位于 `~/whisper.cpp/models/ggml-small.bin`，或调整 `transcribe.ts` 中路径。
  - Verify model at `~/whisper.cpp/models/ggml-small.bin`, or update the path in `transcribe.ts`.
- `yt-dlp: command not found`
  - 通过包管理器安装并确保在 PATH。
  - Install via your package manager and ensure it is in PATH.
- 翻译为空或失败
  - 检查 `OPENAI_API_KEY` 是否配置正确；或稍后重试。
  - Check `OPENAI_API_KEY` is set correctly; retry later if needed.

---

## 部署注意 / Deployment notes

本项目依赖系统级二进制（`yt-dlp`、`whisper`），不适合无状态的纯 Serverless 环境。推荐在具备这些依赖的自托管服务器或容器中部署。

This app depends on system binaries (`yt-dlp`, `whisper`) and is not suited for purely stateless serverless platforms. Prefer self-hosted servers or containers where these binaries are installed.

---

## 许可证 / License

MIT（除外条款以各依赖的原许可为准）。
