export interface ConfirmationEmail {
  subject: string;
  body: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getConfirmationEmail(
  email: string,
  siteUrl: string
): ConfirmationEmail {
  return {
    subject: "ニュースレター登録確認",
    body: `
      <p>${escapeHtml(email)} でニュースレターに登録いただきありがとうございます。</p>
      <p>以下のリンクからサイトをご覧ください:</p>
      <p><a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></p>
    `.trim(),
  };
}
