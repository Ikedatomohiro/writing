"use client";

import { signIn } from "next-auth/react";

type Props = {
  error?: string;
};

export function LoginForm({ error }: Props) {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/articles" });
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "AccessDenied":
        return "アクセスが拒否されました。許可されたアカウントでログインしてください。";
      case "Configuration":
        return "認証設定にエラーがあります。管理者にお問い合わせください。";
      default:
        return "ログインに失敗しました。もう一度お試しください。";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-container-low">
      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] max-w-[400px] w-full">
        <div className="flex flex-col items-center gap-6">
          <h1 className="font-headline text-2xl font-bold text-on-surface">管理画面ログイン</h1>

          {error && (
            <div className="bg-error-container border border-error/20 rounded-lg p-4 w-full">
              <p className="text-error text-sm">
                {getErrorMessage(error)}
              </p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
