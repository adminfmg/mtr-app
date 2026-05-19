import type { NavbarConfig } from "@/types/navbar";

export const navbarConfig: NavbarConfig = {
  brand: {
    logoSrc:
      "https://mytradingreviews.com/wp-content/uploads/2026/03/Logo-My-Trading-Reviews.svg",
    logoAlt: "My Trading Reviews Logo",
    logoHref: "/",
  },

  navLinks: [
    { label: "Ranking", href: "/ranking" },
    { label: "Comparison", href: "/comparison" },
    { label: "Awards", href: "/awards" },
    { label: "IB/Affiliate", href: "/ib-affiliate" },
    { label: "Blogs", href: "/blog" },
    { label: "About Us", href: "/about-us" },
  ],

  cta: {
    label: "Get Listed",
    href: "/get-listed",
  },

  scrollThreshold: 10,
};
