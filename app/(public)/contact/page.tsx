import { ContactForm } from "./ContactForm";
import { ContactInfo } from "./ContactInfo";

export default function ContactPage() {
  const formUrl = process.env.NEXT_PUBLIC_CONTACT_FORM_URL || "";

  return (
    <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <header className="mb-16 md:mb-24 text-center md:text-left max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-on-surface leading-tight font-headline">
          Get in Touch
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant font-body leading-relaxed">
          We value your inquiries and feedback. Please use the form below.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        <section className="lg:col-span-7 bg-surface-container-low p-8 md:p-12 rounded-xl">
          <ContactForm formUrl={formUrl} />
        </section>

        <aside className="lg:col-span-5 space-y-12">
          <ContactInfo />
        </aside>
      </div>
    </main>
  );
}
