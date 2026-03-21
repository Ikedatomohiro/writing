"use client";

interface ContactFormProps {
  formUrl: string;
}

export function ContactForm({ formUrl }: ContactFormProps) {
  if (!formUrl) {
    return <ContactFormFields />;
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <iframe
        src={formUrl}
        title="Contact Form"
        className="w-full border-none"
        style={{ height: "800px" }}
      />
    </div>
  );
}

function ContactFormFields() {
  return (
    <form className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline"
          />
        </div>
        <div className="space-y-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
          Subject
        </label>
        <select className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface appearance-none">
          <option>General</option>
          <option>Health</option>
          <option>Finance</option>
          <option>Tech</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
          Message
        </label>
        <textarea
          placeholder="How can we help you?"
          rows={6}
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
      >
        Send Message
      </button>
    </form>
  );
}
