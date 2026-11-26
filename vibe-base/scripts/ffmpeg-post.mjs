#!/usr/bin/env node
/**
 * ffmpeg-post.mjs — Remotion出力のFFmpeg後処理スクリプト
 *
 * 使い方:
 *   node scripts/ffmpeg-post.mjs <input.mp4> [options]
 *
 * オプション:
 *   --compress          Web向け圧縮 (H.264 CRF23, 目安: 50-70%サイズ削減)
 *   --subtitle <file>   字幕焼き込み (.srt/.ass)
 *   --format <ext>      フォーマット変換 (webm, gif, mov)
 *   --trim <start-end>  切り出し (例: 0:00-0:05)
 *   --thumbnail <time>  サムネイル生成 (例: 0:02)
 *   --concat <files>    結合 (カンマ区切り: a.mp4,b.mp4)
 *   --scale <WxH>       リサイズ (例: 1280x720, 720:-1)
 *   --out <path>        出力先 (省略時: 入力ファイル名_processed)
 *   --dry               コマンドを表示するだけで実行しない
 *
 * 例:
 *   node scripts/ffmpeg-post.mjs out/video.mp4 --compress
 *   node scripts/ffmpeg-post.mjs out/video.mp4 --compress --scale 720:-1
 *   node scripts/ffmpeg-post.mjs out/video.mp4 --subtitle subs.srt --compress
 *   node scripts/ffmpeg-post.mjs out/video.mp4 --format webm
 *   node scripts/ffmpeg-post.mjs out/video.mp4 --trim 0:00-0:05 --out clip.mp4
 *   node scripts/ffmpeg-post.mjs out/video.mp4 --thumbnail 0:02
 *   node scripts/ffmpeg-post.mjs --concat a.mp4,b.mp4 --out merged.mp4
 */

import { execSync, execFileSync } from "child_process";
import { existsSync, writeFileSync, unlinkSync } from "fs";
import { basename, extname, dirname, join } from "path";

const FFMPEG_DIR =
  "C:/Users/user/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin";
const FFMPEG = join(FFMPEG_DIR, "ffmpeg.exe");
const FFPROBE = join(FFMPEG_DIR, "ffprobe.exe");

function parseArgs(argv) {
  const args = { options: [] };
  let i = 2;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--compress") {
      args.compress = true;
    } else if (a === "--subtitle" && argv[i + 1]) {
      args.subtitle = argv[++i];
    } else if (a === "--format" && argv[i + 1]) {
      args.format = argv[++i];
    } else if (a === "--trim" && argv[i + 1]) {
      args.trim = argv[++i];
    } else if (a === "--thumbnail" && argv[i + 1]) {
      args.thumbnail = argv[++i];
    } else if (a === "--concat" && argv[i + 1]) {
      args.concat = argv[++i].split(",");
    } else if (a === "--scale" && argv[i + 1]) {
      args.scale = argv[++i];
    } else if (a === "--out" && argv[i + 1]) {
      args.out = argv[++i];
    } else if (a === "--dry") {
      args.dry = true;
    } else if (!a.startsWith("--")) {
      args.input = a;
    }
    i++;
  }
  return args;
}

function run(cmdArgs, dry) {
  const display = [FFMPEG, ...cmdArgs].join(" ");
  console.log(`> ${display}`);
  if (dry) {
    console.log("(dry run - skipped)");
    return;
  }
  try {
    execFileSync(FFMPEG, cmdArgs, { stdio: "inherit" });
  } catch (e) {
    console.error(`FFmpeg failed with exit code ${e.status}`);
    process.exit(1);
  }
}

function outputPath(input, suffix, ext) {
  const dir = dirname(input);
  const name = basename(input, extname(input));
  const outExt = ext || extname(input);
  return join(dir, `${name}${suffix}${outExt}`);
}

function probe(input) {
  try {
    const out = execFileSync(FFPROBE, [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      input,
    ], { encoding: "utf-8" });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv);

  if (!FFMPEG || !existsSync(FFMPEG)) {
    console.error(`FFmpeg not found at: ${FFMPEG}`);
    console.error("Install: winget install Gyan.FFmpeg");
    process.exit(1);
  }

  // concat mode
  if (args.concat) {
    const files = args.concat;
    for (const f of files) {
      if (!existsSync(f)) {
        console.error(`File not found: ${f}`);
        process.exit(1);
      }
    }
    const listFile = join(dirname(files[0]), "_concat_list.txt");
    const listContent = files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n");
    if (!args.dry) writeFileSync(listFile, listContent);
    const out = args.out || outputPath(files[0], "_merged", extname(files[0]));
    run(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", "-y", out], args.dry);
    if (!args.dry && existsSync(listFile)) unlinkSync(listFile);
    console.log(`\nOutput: ${out}`);
    return;
  }

  if (!args.input) {
    console.log("Usage: node scripts/ffmpeg-post.mjs <input.mp4> [options]");
    console.log("       node scripts/ffmpeg-post.mjs --concat a.mp4,b.mp4 --out merged.mp4");
    console.log("\nRun with --help or see script header for full options.");
    process.exit(0);
  }

  if (!existsSync(args.input)) {
    console.error(`Input file not found: ${args.input}`);
    process.exit(1);
  }

  // probe input
  const info = probe(args.input);
  if (info) {
    const vs = info.streams?.find((s) => s.codec_type === "video");
    const fmt = info.format;
    if (vs && fmt) {
      const sizeMB = (parseInt(fmt.size, 10) / 1048576).toFixed(1);
      console.log(`Input: ${args.input}`);
      console.log(`  ${vs.width}x${vs.height} | ${vs.codec_name} | ${parseFloat(fmt.duration).toFixed(1)}s | ${sizeMB}MB`);
    }
  }

  // thumbnail
  if (args.thumbnail) {
    const out = args.out || outputPath(args.input, "_thumb", ".jpg");
    run(["-i", args.input, "-ss", args.thumbnail, "-vframes", "1", "-q:v", "2", "-y", out], args.dry);
    console.log(`\nThumbnail: ${out}`);
    return;
  }

  // build filter chain
  const filters = [];
  if (args.subtitle) {
    if (!existsSync(args.subtitle)) {
      console.error(`Subtitle file not found: ${args.subtitle}`);
      process.exit(1);
    }
    const subPath = args.subtitle.replace(/\\/g, "/").replace(/:/g, "\\:");
    filters.push(`subtitles='${subPath}'`);
  }
  if (args.scale) {
    const [w, h] = args.scale.split("x");
    filters.push(`scale=${w}:${h}`);
  }

  // build command
  const cmd = ["-i", args.input];

  // trim
  if (args.trim) {
    const [start, end] = args.trim.split("-");
    if (start) cmd.splice(0, 0, "-ss", start);
    if (end) cmd.push("-to", end);
  }

  // filters
  if (filters.length > 0) {
    cmd.push("-vf", filters.join(","));
  }

  // format/codec
  const outExt = args.format ? `.${args.format}` : extname(args.input);

  if (args.compress || args.subtitle || args.scale) {
    if (outExt === ".webm") {
      cmd.push("-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-c:a", "libopus");
    } else {
      cmd.push("-c:v", "libx264", "-crf", "23", "-preset", "medium", "-c:a", "aac", "-b:a", "128k");
    }
  } else if (args.format === "webm") {
    cmd.push("-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-c:a", "libopus");
  } else if (args.format === "gif") {
    cmd.push("-vf", filters.length > 0 ? filters.join(",") + ",fps=15,scale=480:-1" : "fps=15,scale=480:-1");
    // remove duplicate -vf if already added
    const vfIdx = cmd.indexOf("-vf");
    if (vfIdx !== cmd.lastIndexOf("-vf")) {
      cmd.splice(vfIdx, 2);
    }
  } else if (args.format && !args.compress) {
    cmd.push("-c:v", "copy", "-c:a", "copy");
  }

  // output
  let suffix = "";
  if (args.compress) suffix += "_compressed";
  if (args.subtitle) suffix += "_sub";
  if (args.scale) suffix += `_${args.scale.replace(":", "x")}`;
  if (args.trim) suffix += "_trimmed";

  const out = args.out || outputPath(args.input, suffix, outExt);
  cmd.push("-y", out);

  run(cmd, args.dry);

  // report
  if (!args.dry) {
    const outInfo = probe(out);
    if (outInfo?.format) {
      const inSize = parseInt(info?.format?.size || "0", 10);
      const outSize = parseInt(outInfo.format.size, 10);
      const outMB = (outSize / 1048576).toFixed(1);
      console.log(`\nOutput: ${out} (${outMB}MB)`);
      if (inSize > 0) {
        const ratio = ((1 - outSize / inSize) * 100).toFixed(0);
        console.log(`  Size reduction: ${ratio}%`);
      }
    }
  }
}

main();
