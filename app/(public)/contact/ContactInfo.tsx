export function ContactInfo() {
  return (
    <>
      <div className="space-y-10">
        <ContactDetail
          icon="location_on"
          iconBg="bg-primary-fixed"
          iconColor="text-primary"
          title="Office Address"
        >
          <p className="text-lg leading-relaxed font-medium">
            888 Editorial Way, Suite 400
            <br />
            New York, NY 10013
          </p>
        </ContactDetail>

        <ContactDetail
          icon="mail"
          iconBg="bg-secondary-fixed"
          iconColor="text-secondary"
          title="Email Contact"
        >
          <p className="text-lg leading-relaxed font-medium">
            hello@theeditorial.com
            <br />
            press@theeditorial.com
          </p>
        </ContactDetail>

        <ContactDetail
          icon="share"
          iconBg="bg-tertiary-fixed"
          iconColor="text-tertiary"
          title="Follow Us"
        >
          <div className="flex gap-4 mt-2">
            <SocialLink icon="public" />
            <SocialLink icon="chat" />
            <SocialLink icon="rss_feed" />
          </div>
        </ContactDetail>
      </div>

      <MapPlaceholder />
    </>
  );
}

function ContactDetail({
  icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-6">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function SocialLink({ icon }: { icon: string }) {
  return (
    <a
      href="#"
      className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all"
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
    </a>
  );
}

function MapPlaceholder() {
  return (
    <div className="relative w-full aspect-video md:aspect-square lg:aspect-video rounded-2xl overflow-hidden bg-surface-container-high group">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 rounded-full bg-primary" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold tracking-tight shadow-sm">
        VIEW ON GOOGLE MAPS
      </div>
    </div>
  );
}
