"use client";

export interface NewsletterSignupProps {
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  title = "ニュースレター",
  description = "最新記事をメールでお届けします。",
}: NewsletterSignupProps) {
  return (
    <section
      role="region"
      data-testid="newsletter-signup"
      aria-label={title}
      className="bg-primary-container rounded-xl p-5"
    >
      <h3 className="font-body text-base font-semibold text-on-primary-container mb-2">
        {title}
      </h3>
      <p className="font-body text-sm text-on-primary-container/80 mb-4">
        {description}
      </p>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2"
      >
        <input
          type="email"
          placeholder="メールアドレス"
          aria-label="メールアドレス"
          className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="w-full px-3 py-2 text-sm font-semibold rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity"
        >
          登録する
        </button>
      </form>
    </section>
  );
}
