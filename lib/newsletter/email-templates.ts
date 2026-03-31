export interface ConfirmationEmail {
  subject: string;
  body: string;
}

export function getConfirmationEmail(
  email: string,
  siteUrl: string
): ConfirmationEmail {
  return {
    subject: "ニュースレター登録確認",
    body: `
      <p>${email} でニュースレターに登録いただきありがとうございます。</p>
      <p>以下のリンクからサイトをご覧ください:</p>
      <p><a href="${siteUrl}">${siteUrl}</a></p>
    `.trim(),
  };
}
