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
      className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl p-6"
    >
      <h3 className="text-on-primary font-headline font-bold text-lg mb-2">
        {title}
      </h3>
      <p className="text-on-primary/80 text-sm mb-4">
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
          className="w-full bg-on-primary/10 border-0 rounded-lg py-3 px-4 text-sm text-on-primary placeholder:text-on-primary/40 focus:outline-none focus:ring-2 focus:ring-on-primary/30"
        />
        <button
          type="submit"
          className="w-full bg-surface-container-lowest text-primary font-bold py-3 rounded-lg hover:bg-surface-container-lowest/90 transition-colors text-sm"
        >
          登録する
        </button>
      </form>
    </section>
  );
}
