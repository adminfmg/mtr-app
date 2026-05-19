export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarBrand {
  logoSrc: string;
  logoAlt: string;
  logoHref: string;
}

export interface NavbarCTA {
  label: string;
  href: string;
}

export interface NavbarConfig {
  brand: NavbarBrand;
  navLinks: NavLink[];
  cta: NavbarCTA;
  scrollThreshold: number;
}
