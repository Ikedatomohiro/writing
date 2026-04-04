import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { addSubscriber } from "@/lib/newsletter/storage";
import { z } from "zod";
import { rateLimit } from "@/lib/api/rate-limit";

const SubscribeSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.NEWSLETTER_ADMIN_EMAIL;

  if (!gmailUser || !gmailPassword || !adminEmail) {
    return NextResponse.json(
      { error: "メール設定が不足しています" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストが不正です" },
      { status: 400 }
    );
  }

  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  let result;
  try {
    result = await addSubscriber(email);
  } catch {
    return NextResponse.json(
      { error: "登録処理に失敗しました" },
      { status: 500 }
    );
  }

  if (!result.success) {
    if (result.error === "duplicate") {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "登録に失敗しました" },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPassword },
    });

    await transporter.sendMail({
      from: `"ニュースレター" <${gmailUser}>`,
      to: adminEmail,
      subject: `[ニュースレター] 新規登録: ${email}`,
      text: `新しい購読者が登録しました。\n\nメールアドレス: ${email}`,
    });
  } catch {
    // メール送信失敗は登録自体には影響しない
  }

  return NextResponse.json({ success: true });
}
