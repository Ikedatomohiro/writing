import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-on-surface leading-tight font-headline">
          お問い合わせ
        </h1>
        <p className="text-base md:text-lg text-on-surface-variant font-body leading-relaxed">
          運営へのご質問やフィードバックは、以下のフォームよりお送りください。
        </p>
      </header>

      <section className="bg-surface-container-low p-8 md:p-12 rounded-xl">
        <ContactForm />
      </section>
    </main>
  );
}
