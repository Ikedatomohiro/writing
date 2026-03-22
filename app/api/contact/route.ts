import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function isValidBody(body: unknown): body is ContactBody {
  const b = body as ContactBody;
  return !!(b?.name && b?.email && b?.subject && b?.message);
}

export async function POST(request: Request) {
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

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPassword },
  });

  try {
    await transporter.sendMail({
      from: `"${body.name}" <${gmailUser}>`,
      to: contactTo,
      replyTo: body.email,
      subject: `[お問い合わせ] ${body.subject} - ${body.name}`,
      text: [
        `お名前: ${body.name}`,
        `メールアドレス: ${body.email}`,
        `お問い合わせ項目: ${body.subject}`,
        ``,
        `メッセージ:`,
        body.message,
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
