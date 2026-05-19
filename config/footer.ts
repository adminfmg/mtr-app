import type { FooterConfig } from "@/types/footer";

export const footerConfig: FooterConfig = {
  newsletter: {
    headingPrefix: "Subscribe to the",
    highlight: "MyTradingReview",
    headingSuffix: "Newsletter",
    description:
      "Be the first to know about new reviews, promotions, and broker news.",
    placeholder: "name@email.com",
    submitLabel: "Subscribe",
    formName: "New Form",
    hiddenFields: [
      { name: "post_id", value: "17" },
      { name: "form_id", value: "c96ef40" },
      {
        name: "referer_title",
        value: "Introduce a Broker Program | Partner with MyTradingReviews",
      },
      { name: "queried_id", value: "12399" },
    ],
  },

  brokerHeading: "Find The Best Broker in 2026",
  followHeading: "Follow Us",

  socials: [
    {
      platform: "x-twitter",
      label: "X-twitter",
      href: "https://x.com/MTradingReviews",
    },
    {
      platform: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/mytradingreviews.official/",
    },
    {
      platform: "youtube",
      label: "Youtube",
      href: "https://www.youtube.com/@MyTradingReviews",
    },
    {
      platform: "linkedin",
      label: "Linkedin",
      href: "https://www.linkedin.com/company/mytradingreviews/",
    },
  ],

  legalLinks: [
    { label: "Terms & Condition", href: "/terms-conditions/" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],

  ctaDescription:
    "Compare broker reviews, awards, rankings, and latest bonuses.",

  ctas: [
    { label: "Get Listed", href: "#", variant: "primary" },
    { label: "See Broker", href: "#", variant: "outline" },
  ],

  copyright: "@ 2026 My Trading Reviews. All rights reserved.",

  navLinks: [
    { label: "Reviews", href: "#", variant: "grey" },
    { label: "Awards", href: "#", variant: "grey" },
    { label: "Blogs", href: "/blog", variant: "white" },
    { label: "Comparison", href: "#", variant: "grey" },
    { label: "About Us", href: "/about-us", variant: "white" },
  ],

  brand: {
    logoSrc:
      "https://mytradingreviews.com/wp-content/uploads/2026/03/Logo-My-Trading-Reviews.svg",
    logoAlt: "",
    logoHref: "https://mytradingreviews.com",
    logoWidth: 168,
    logoHeight: 20,
  },
};