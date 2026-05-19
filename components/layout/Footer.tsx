import Link from "next/link";
import { footerConfig } from "@/config/footer";
import type { SocialPlatform } from "@/types/footer";

const SOCIAL_ICON_PATHS: Record<SocialPlatform, { viewBox: string; path: string }> = {
  "x-twitter": {
    viewBox: "0 0 512 512",
    path: "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z",
  },
  instagram: {
    viewBox: "0 0 448 512",
    path: "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z",
  },
  youtube: {
    viewBox: "0 0 576 512",
    path: "M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z",
  },
  linkedin: {
    viewBox: "0 0 448 512",
    path: "M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z",
  },
};

const CTA_VARIANTS = {
  primary: "bg-[var(--mtr-green)] text-white hover:bg-[var(--mtr-green-dk)]",
  outline:
    "bg-transparent border border-[var(--mtr-border)] text-white hover:border-[var(--mtr-green)]",
} as const;

const NAV_VARIANTS = {
  white: "text-white",
  grey: "text-[var(--mtr-muted)]",
} as const;

export default function Footer() {
  const {
    newsletter,
    brokerHeading,
    followHeading,
    socials,
    legalLinks,
    ctaDescription,
    ctas,
    copyright,
    navLinks,
    brand,
  } = footerConfig;

  return (
    <footer className="w-full bg-transparent pt-16 pb-8 border-t border-[rgba(26,46,69,0.5)] mt-10 font-[Gantari,sans-serif]">
      <div className="max-w-[1140px] mx-auto px-4 flex flex-col gap-12">

        {/* SECTION 1: Newsletter */}
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-2xl md:text-[28px] font-bold text-white">
            {newsletter.headingPrefix}{" "}
            <span className="text-[var(--mtr-green)]">{newsletter.highlight}</span>{" "}
            {newsletter.headingSuffix}
          </h2>

          <p className="text-[var(--mtr-muted)] text-[15px]">
            {newsletter.description}
          </p>

          <form
            method="post"
            name={newsletter.formName}
            aria-label={newsletter.formName}
            className="flex w-full max-w-[420px] mt-2 gap-3"
          >
            {newsletter.hiddenFields.map((field) => (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={field.value}
              />
            ))}

            <label htmlFor="form-field-email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="form-field-email"
              name="form_fields[email]"
              placeholder={newsletter.placeholder}
              required
              size={1}
              className="flex-1 px-4 py-3 rounded-md bg-[var(--mtr-inner)] border border-[var(--mtr-border)] text-white text-sm outline-none transition-colors focus:border-[var(--mtr-green)]"
            />
            <button
              type="submit"
              id="subscribe-button"
              className="px-6 py-3 bg-[var(--mtr-green)] text-white text-sm font-bold rounded-md border-none cursor-pointer transition-colors hover:bg-[var(--mtr-green-dk)]"
            >
              {newsletter.submitLabel}
            </button>
          </form>
        </div>

        {/* SECTION 2: Middle - Broker, Socials, Legal, CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-t border-[rgba(26,46,69,0.5)] pt-12">

          {/* Col 1: Broker heading + Follow Us + Socials */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white">{brokerHeading}</h2>

            <div className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-white">{followHeading}</h2>
              <div className="flex items-center gap-3" role="list">
                {socials.map((social) => {
                  const icon = SOCIAL_ICON_PATHS[social.platform];
                  return (
                    <a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="external noopener noreferrer"
                      role="listitem"
                      className="p-2.5 bg-[rgba(0,168,107,0.1)] border border-[var(--mtr-green-border)] rounded-full text-[var(--mtr-green)] inline-flex items-center justify-center transition-all hover:bg-[var(--mtr-green)] hover:text-white"
                    >
                      <span className="sr-only">{social.label}</span>
                      <svg
                        aria-hidden="true"
                        width="16"
                        height="16"
                        viewBox={icon.viewBox}
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d={icon.path} />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Col 2: Legal Links */}
          <div className="flex flex-col gap-6">
            <ul className="list-none flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white font-semibold text-[15px] no-underline transition-colors hover:text-[var(--mtr-green)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: CTA Description + Buttons + Copyright */}
          <div className="flex flex-col gap-6">
            <p className="text-[var(--mtr-muted)] text-[15px] leading-relaxed">
              {ctaDescription}
            </p>

            <div className="flex gap-3">
              {ctas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={`px-5 py-2.5 text-[13px] font-bold rounded-md no-underline transition-all inline-flex items-center justify-center ${CTA_VARIANTS[cta.variant]}`}
                >
                  {cta.label}
                </Link>
              ))}
            </div>

            <p className="text-[var(--mtr-muted)] text-[13px] mt-2">
              {copyright}
            </p>
          </div>
        </div>

        {/* SECTION 3: Bottom - Logo + Nav */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[rgba(26,46,69,0.5)] pt-8">
          <a href={brand.logoHref}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoSrc}
              alt={brand.logoAlt}
              width={brand.logoWidth}
              height={brand.logoHeight}
              className="w-[168px] h-auto block"
            />
          </a>

          <ul className="list-none flex flex-wrap items-center justify-center gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`text-[15px] font-semibold no-underline transition-colors hover:text-[var(--mtr-green)] ${NAV_VARIANTS[link.variant ?? "white"]}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </footer>
  );
}
