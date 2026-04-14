/**
 * テストデータ削除スクリプト
 * /tmp/seed-ids.json を読んで x_series を削除する
 * (x_posts は CASCADE DELETE で自動削除される前提)
 *
 * 実行: npx tsx scripts/cleanup-test-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local を手動で読み込む
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const seedFile = "/tmp/seed-ids.json";
  if (!fs.existsSync(seedFile)) {
    console.error("seed-ids.json が見つかりません。先に seed-test-data.ts を実行してください。");
    process.exit(1);
  }

  const seedData = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
  const ids: string[] = seedData.x_series_ids;

  if (!ids || ids.length === 0) {
    console.log("削除するIDがありません");
    return;
  }

  console.log(`${ids.length}件のシリーズを削除しています...`);

  // x_posts を先に削除（FKがある場合のため）
  const { error: postsError } = await supabase
    .from("x_posts")
    .delete()
    .in("series_id", ids);

  if (postsError) {
    console.error("x_posts 削除エラー:", postsError);
  } else {
    console.log("  x_posts を削除しました");
  }

  // x_series を削除
  const { error: seriesError } = await supabase
    .from("x_series")
    .delete()
    .in("id", ids);

  if (seriesError) {
    console.error("x_series 削除エラー:", seriesError);
    process.exit(1);
  }

  console.log(`  x_series ${ids.length}件を削除しました`);

  // seed-ids.json を削除
  fs.unlinkSync(seedFile);
  console.log("\n完了: テストデータを削除し、/tmp/seed-ids.json を削除しました");

  // 削除確認
  const { count } = await supabase
    .from("x_series")
    .select("*", { count: "exact", head: true })
    .in("id", ids);

  console.log(`確認: 残存件数 = ${count ?? 0}件 (0件が正常)`);
}

main().catch(console.error);
