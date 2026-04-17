#!/usr/bin/env node
// Supabase articles.content 内のUnsplash画像URL + クレジット行 を
// /images/articles/<slug>/illustration_*.png に一括置換してupsertする。
// illustration-scenes.yaml の順序で illustration_a, _b, _c... を割り当て。

const fs = require("fs");
const path = require("path");

for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const yaml = require("js-yaml");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SCENES_PATH = path.join(__dirname, "illustration-scenes.yaml");
const scenes = yaml.load(fs.readFileSync(SCENES_PATH, "utf-8"));

// Unsplash画像1枚分にマッチ（alt + URL、周辺のクレジット行もまとめて消す）
// 形式バリエーション:
//   ![alt](https://images.unsplash.com/...)
//   *Photo by [...](...) on [Unsplash](...)*
//   Photo by [...](...) on [Unsplash](...)
//   撮影: [...](...) / [Unsplash](...)
const IMG_RE = /!\[([^\]]*)\]\(https:\/\/images\.unsplash\.com\/[^)]+\)/g;
// クレジット行（画像直後にある場合のみ消したい）
const CREDIT_RE =
  /\n\*?(?:Photo by|撮影[:：])\s*\[[^\]]+\]\([^)]+\)\s*(?:\/|on)\s*\[Unsplash\]\([^)]+\)\*?\s*\n?/;

async function processArticle(article) {
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, content")
    .eq("slug", article.slug)
    .single();
  if (error) throw error;

  let content = data.content;
  const imgs = article.images;
  let idx = 0;
  let changes = 0;

  content = content.replace(IMG_RE, (match, altInOriginal) => {
    if (idx >= imgs.length) {
      console.warn(
        `  WARN: ${article.slug} — Unsplash image #${idx + 1} has no replacement scene, removing only`
      );
      idx++;
      changes++;
      return "";
    }
    const { kind, alt } = imgs[idx];
    const newAlt = alt || altInOriginal;
    const replacement = `![${newAlt}](/images/articles/${article.slug}/${kind}.png)`;
    idx++;
    changes++;
    return replacement;
  });

  // クレジット行も削除（複数回）
  let prev;
  do {
    prev = content;
    content = content.replace(CREDIT_RE, "\n");
  } while (content !== prev);

  // 置換後に連続する空行が増えるので整理
  content = content.replace(/\n{3,}/g, "\n\n");

  if (changes === 0) {
    console.log(`  SKIP ${article.slug}: no Unsplash images found`);
    return;
  }

  const { error: upErr } = await supabase
    .from("articles")
    .update({ content })
    .eq("slug", article.slug);
  if (upErr) throw upErr;
  console.log(`  OK ${article.slug}: replaced ${changes} image(s)`);
}

(async () => {
  console.log(`Processing ${scenes.length} articles...`);
  for (const article of scenes) {
    await processArticle(article);
  }
  console.log("Done.");
})();
