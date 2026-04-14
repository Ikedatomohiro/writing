/**
 * テストデータ投入スクリプト
 * x_series に5件、それぞれに x_posts 2件ずつを挿入する
 *
 * 実行: npx tsx scripts/seed-test-data.ts
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

const SEED_SERIES = [
  {
    account: "pao-pao-cho",
    theme: "[テストデータ] Threads運用の極意",
    status: "draft",
    queue_order: null,
  },
  {
    account: "pao-pao-cho",
    theme: "[テストデータ] AIと創作の話",
    status: "queued",
    queue_order: 1,
  },
  {
    account: "pao-pao-cho",
    theme: "[テストデータ] 仙台の春",
    status: "queued",
    queue_order: 2,
  },
  {
    account: "matsumoto_sho",
    theme: "[テストデータ] 書くことと考えること",
    status: "draft",
    queue_order: null,
  },
  {
    account: "matsumoto_sho",
    theme: "[テストデータ] 50代のデジタル生活",
    status: "posted",
    queue_order: null,
  },
];

async function main() {
  console.log("テストデータを投入しています...");

  const seriesIds: string[] = [];

  for (const series of SEED_SERIES) {
    const { data, error } = await supabase
      .from("x_series")
      .insert({
        account: series.account,
        theme: series.theme,
        status: series.status,
        queue_order: series.queue_order,
        is_posted: series.status === "posted",
      })
      .select("id")
      .single();

    if (error) {
      console.error(`シリーズ挿入エラー: ${series.theme}`, error);
      continue;
    }

    seriesIds.push(data.id);
    console.log(`  シリーズ作成: ${series.theme} (id: ${data.id})`);

    // 各シリーズに2件の投稿を追加
    const posts = [
      {
        series_id: data.id,
        position: 0,
        text: `${series.theme} - 投稿1\n\nテスト投稿のサンプルテキストです。実際の運用では、ここに本文が入ります。`,
      },
      {
        series_id: data.id,
        position: 1,
        text: `${series.theme} - 投稿2\n\n続きのテキストです。#テスト #サンプル`,
      },
    ];

    const { error: postsError } = await supabase
      .from("x_posts")
      .insert(posts);

    if (postsError) {
      console.error(`投稿挿入エラー: ${series.theme}`, postsError);
    } else {
      console.log(`    投稿2件を追加しました`);
    }
  }

  // seed-ids.json に保存
  const seedIds = { x_series_ids: seriesIds, created_at: new Date().toISOString() };
  fs.writeFileSync("/tmp/seed-ids.json", JSON.stringify(seedIds, null, 2));
  console.log(`\n完了: ${seriesIds.length}件のシリーズを作成しました`);
  console.log("IDは /tmp/seed-ids.json に保存しました");
}

main().catch(console.error);
