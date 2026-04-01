const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONTENT_DIR = path.join(__dirname, "../content");

async function main() {
  const categories = ["asset", "tech", "health"];
  let inserted = 0,
    failed = 0;

  for (const category of categories) {
    const dir = path.join(CONTENT_DIR, category);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = data.slug || file.replace(/\.mdx$/, "");

      const { error } = await supabase.from("articles").upsert(
        {
          slug,
          category: data.category || category,
          title: data.title || "",
          description: data.description || "",
          content: content.trim(),
          date: data.date || new Date().toISOString(),
          tags: (data.tags || []).map((t) => t.replace(/^#/, "")),
          thumbnail: data.thumbnail || null,
          published: data.published !== false,
        },
        { onConflict: "slug" }
      );

      if (error) {
        console.error("FAILED:", slug, error.message);
        failed++;
      } else {
        console.log("OK:", slug);
        inserted++;
      }
    }
  }

  console.log("\ninserted:", inserted, "/ failed:", failed);
}

main().catch(console.error);
