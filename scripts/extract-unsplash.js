#!/usr/bin/env node
const fs = require("fs");
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, thumbnail, content")
    .eq("category", "tech")
    .eq("published", true)
    .order("date", { ascending: false });
  if (error) throw error;

  const imgRe = /!\[(?<alt>[^\]]*)\]\((?<url>https:\/\/images\.unsplash\.com\/[^)]+)\)/g;
  const report = [];
  for (const row of data) {
    const matches = [...row.content.matchAll(imgRe)];
    const thumbIsUnsplash = (row.thumbnail || "").includes("unsplash.com");
    report.push({
      slug: row.slug,
      title: row.title,
      thumbnail_unsplash: thumbIsUnsplash,
      body_unsplash_count: matches.length,
      body_images: matches.map((m) => ({ alt: m.groups.alt })),
    });
  }
  console.log(JSON.stringify(report, null, 2));
})();
