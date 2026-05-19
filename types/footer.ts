export type SocialPlatform = "x-twitter" | "instagram" | "youtube" | "linkedin";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
  variant?: "white" | "grey";
}

export interface FooterCTA {
  label: string;
  href: string;
  variant: "primary" | "outline";
}

export interface FooterConfig {
  newsletter: {
    headingPrefix: string;
    highlight: string;
    headingSuffix: string;
    description: string;
    placeholder: string;
    submitLabel: string;
    formName: string;
    hiddenFields: { name: string; value: string }[];
  };
  brokerHeading: string;
  followHeading: string;
  socials: SocialLink[];
  legalLinks: FooterLink[];
  ctaDescription: string;
  ctas: FooterCTA[];
  copyright: string;
  navLinks: FooterLink[];
  brand: {
    logoSrc: string;
    logoAlt: string;
    logoHref: string;
    logoWidth: number;
    logoHeight: number;
  };
}