// src/data/content.ts
//
// Content shape + UI nav. The portfolio data itself is no longer kept here —
// it's pulled at runtime from charliegleason.com (see ./store). This file holds
// the shared type for that data, the empty seed the store starts from before the
// first fetch lands, and the static terminal nav (which never came from the API).

export const menuItems = ["About", "Projects", "Writing", "More", "Contact"] as const;
export type MenuItem = (typeof menuItems)[number];

// ── Shared content shape ──────────────────────────────────────────────────

export interface Bio {
  short: string;
  full: string;
}

export interface Metadata {
  location: string;
  company: string;
  website: string;
  github: string;
}

export interface Project {
  name: string;
  description: string;
  url: string;
}

export interface WritingItem {
  title: string;
  description: string;
  url: string;
}

export interface Award {
  year: string;
  title: string;
}

export interface Talk {
  year: string;
  title: string;
}

export interface Education {
  degree: string;
  school: string;
  years: string;
  note?: string;
}

export interface Certification {
  year: string;
  title: string;
}

export interface Volunteering {
  org: string;
  years: string;
}

export interface Race {
  year: string;
  title: string;
}

export interface Races {
  triathlons: Race[];
  halfMarathons: Race[];
  marathons: Race[];
}

export interface ContactItem {
  label: string;
  url: string;
  icon: string;
  description: string;
}

export interface Content {
  bio: Bio;
  metadata: Metadata;
  projects: Project[];
  writing: WritingItem[];
  awards: Award[];
  talks: Talk[];
  education: Education[];
  certifications: Certification[];
  volunteering: Volunteering[];
  races: Races;
  contact: ContactItem[];
}

// The store's cold-start seed. Sections render empty until the first fetch from
// charliegleason.com publishes real content (see ./store). There is no offline
// fallback: if the site is unreachable, the terminal shows empty sections.
export const emptyContent: Content = {
  bio: { short: "", full: "" },
  metadata: { location: "", company: "", website: "", github: "" },
  projects: [],
  writing: [],
  awards: [],
  talks: [],
  education: [],
  certifications: [],
  volunteering: [],
  races: { triathlons: [], halfMarathons: [], marathons: [] },
  contact: [],
};
