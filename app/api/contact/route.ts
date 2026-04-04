import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { rateLimit } from "@/lib/api/rate-limit";

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]/g, "").trim().slice(0, 200);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const contactTo = process.env.CONTACT_EMAIL_TO;

  if (!gmailUser || !gmailPassword || !contactTo) {
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

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容が不正です", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;
  const safeName = sanitizeHeaderValue(name);
  const safeSubject = sanitizeHeaderValue(subject);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPassword },
  });

  try {
    await transporter.sendMail({
      from: `"${safeName}" <${gmailUser}>`,
      to: contactTo,
      replyTo: email,
      subject: `[お問い合わせ] ${safeSubject} - ${safeName}`,
      text: [
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        `お問い合わせ項目: ${subject}`,
        ``,
        `メッセージ:`,
        message,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "メールの送信に失敗しました" },
      { status: 500 }
    );
  }
}
