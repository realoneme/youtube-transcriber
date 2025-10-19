'use server';

import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

export interface TranscriptSegment {
  original: string;
  translated: string;
  start?: number;
  end?: number;
}

const execPromise = util.promisify(exec);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧩 辅助：读取 Whisper JSON 输出并转为结构化 segments
function parseWhisperJson(jsonPath: string): TranscriptSegment[] {
  if (!fs.existsSync(jsonPath)) {
    return [];
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8').trim();
  if (!raw) {
    return [];
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return [];
  }

  // whisper.cpp 的 JSON 输出格式：
  // { "transcription": [ { "timestamps": {...}, "offsets": {...}, "text": "..." }, ... ] }

  const transcriptionArray = data.transcription || [];

  if (!transcriptionArray.length) {
    return [];
  }

  return transcriptionArray
    .filter((seg: any) => seg.text && seg.text.trim().length > 0)
    .map((seg: any) => ({
      original: seg.text.trim(),
      translated: '',
      start: seg.offsets?.from ? seg.offsets.from / 1000 : undefined, // 转换为秒
      end: seg.offsets?.to ? seg.offsets.to / 1000 : undefined, // 转换为秒
    }));
}

export interface TranscribeResult {
  segments: TranscriptSegment[];
  audioPath: string;
}

function buildCombinedText(segments: TranscriptSegment[]): string {
  return segments.map((s, i) => `【${i + 1}】${s.original}`).join('\n');
}

function buildTranslatePrompt(
  targetLang: string,
  combinedText: string
): string {
  return (
    `You are a professional subtitle translator. Translate each sentence into natural ${targetLang}. ` +
    `Keep the numbering and output one line per item. Do not add extra commentary.\n\n` +
    `【1】...\n【2】...\n...\n\n` +
    combinedText
  );
}

export async function transcribe(
  url: string,
  targetLang: string = 'zh'
): Promise<TranscribeResult> {
  // 🐛 调试模式：跳过 URL 检查
  // if (!url) return [{ original: '', translated: '❌ 缺少 URL' }];

  const fileName = `audio_${Date.now()}.mp3`;
  const filePath = path.join(process.cwd(), 'assets', fileName);

  try {
    // 🐛 调试模式：使用已存在的音频文件
    // TODO: 恢复正常模式时，取消下面的注释并删除调试代码
    /**/

    await execPromise(`yt-dlp -x --audio-format mp3 "${url}" -o ${filePath}`);

    // 检查是否已有音频文件
    const existingAudioFiles = fs
      .readdirSync(path.join(process.cwd(), 'assets'))
      .filter((file) => file.endsWith('.mp3'))
      .sort((a, b) => b.localeCompare(a)); // 按文件名倒序，获取最新的

    if (existingAudioFiles.length === 0) {
      throw new Error('没有找到已存在的音频文件');
    }

    const lang = 'auto';

    const existingFile = existingAudioFiles[0];
    const existingFilePath = path.join(process.cwd(), 'assets', existingFile);

    // 🧠 使用 Whisper JSON 输出模式（包含时间信息）

    const modelPath = path.resolve(
      process.env.HOME || '',
      'whisper.cpp/models/ggml-small.bin'
    );
    const whisperCmd = `whisper -m ${modelPath} -f ${existingFilePath} -oj -l ${lang}`;

    try {
      const whisperResult = await execPromise(whisperCmd);
      await new Promise((r) => setTimeout(r, 500));
    } catch (whisperError) {
      throw whisperError;
    }

    // 读取 Whisper 生成的 JSON 文件
    const jsonFile = existingFilePath + '.json';

    const segments = parseWhisperJson(jsonFile);

    if (!segments.length) {
      throw new Error('未找到任何识别结果。');
    }

    // 🌏 翻译每个段落（合并后再切分，节省 tokens）
    const combinedText = buildCombinedText(segments);
    const prompt = buildTranslatePrompt(targetLang, combinedText);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const translated = response.choices[0].message.content?.trim() ?? '';

    // 将翻译结果按编号拆分回去
    const lines = translated.split('\n').filter((l) => l.startsWith('【'));
    for (const line of lines) {
      const match = line.match(/^【(\d+)】(.*)$/);
      if (match) {
        const index = parseInt(match[1], 10) - 1;
        if (segments[index]) {
          segments[index].translated = match[2].trim();
        }
      }
    }

    // 若有未填充的翻译，降级回原文
    for (const seg of segments) {
      if (!seg.translated || seg.translated.trim().length === 0) {
        seg.translated = seg.original;
      }
    }

    // 🐛 调试模式：不清理文件，保留用于调试

    // 仅清理临时 JSON 文件；保留音频文件供前端播放
    try {
      fs.unlinkSync(jsonFile);
    } catch {}

    return {
      segments,
      audioPath: `/assets/${existingFile}`,
    };
  } catch (err) {
    return {
      segments: [
        { original: '', translated: '❌ 转写失败：' + (err as Error).message },
      ],
      audioPath: '',
    };
  }
}

// 仅翻译：根据已存在的 segments 生成新语言的译文，返回译文数组
export async function translateSegments(
  segments: TranscriptSegment[],
  targetLang: string
): Promise<string[]> {
  try {
    const combinedText = buildCombinedText(segments);
    const prompt = buildTranslatePrompt(targetLang, combinedText);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const translated = response.choices[0].message.content?.trim() ?? '';
    const lines = translated.split('\n').filter((l) => l.startsWith('【'));

    const out: string[] = Array.from(
      { length: segments.length },
      (_, i) => segments[i].original
    );
    for (const line of lines) {
      const match = line.match(/^【(\d+)】(.*)$/);
      if (match) {
        const index = parseInt(match[1], 10) - 1;
        if (index >= 0 && index < out.length) {
          out[index] = match[2].trim();
        }
      }
    }
    return out;
  } catch {
    return segments.map((s) => s.original);
  }
}
