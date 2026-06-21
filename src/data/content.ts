// src/data/content.ts

export const bio = {
  short: "I'm a principal systems engineer at Cloudflare, working on design engineering and developer experience at the intersection of code and AI.",
  full: `I'm a principal systems engineer at Cloudflare, working on design engineering and developer experience at the intersection of code and AI.

Before that I was a staff designer at Replicate, a lead product designer at Salesforce, owned design and brand at Heroku, worked on design and front-end development for London-based crowdfunding publisher Unbound, co-founded the Melbourne-based social film site Goodfilms, and was the technical lead of the Clemenger BBDO ad agency.

I studied design and computer science, and I like the space between creativity and code. I also enjoy the blind terror of the creative process, solving difficult problems, and writing custom GLSL shaders.

I cannot skateboard. I tried, but it was a whole thing.`,
};

export const metadata = {
  location: "San Francisco, CA",
  company: "Cloudflare",
  website: "charliegleason.com",
  github: "superhighfives",
};

export const projects = [
  {
    name: "Lysterfield Lake",
    description: "An interactive AI-generated 3D fever dream",
    url: "lysterfieldlake.com",
  },
  {
    name: "Pika",
    description: "An open-source colour picker app for macOS",
    url: "superhighfives.com/pika",
  },
  {
    name: "Tweetflight",
    description: "A Twitter-powered music video",
    url: "tweetflight.wewerebrightly.com",
  },
  {
    name: "Sandpit",
    description: "An open-source creative-coding library",
    url: "sandpitjs.com",
  },
  {
    name: "Drag It Down On You",
    description: "Lyric karaoke for Ceres",
    url: "dragitdownonyou.com",
  },
  {
    name: "Rugby",
    description: "A GIF-powered music video",
    url: "rugby.wewerebrightly.com",
  },
  {
    name: "I Will Never Let You Go",
    description: "A WebGL-powered music video",
    url: "iwillneverletyougo.com",
  },
];

export const writing = [
  {
    title: "Running Ollama on your desktop GPU from anywhere with Cloudflare Tunnel",
    description: "A complete guide to exposing Ollama running on a Windows PC with a 4090 GPU so you can use it remotely with opencode via a secure Cloudflare Tunnel.",
    url: "code.charliegleason.com/cloudflare-tunnel-ollama-opencode",
  },
  {
    title: "Building an MCP weather server on Cloudflare Workers",
    description: "A complete guide to building and deploying a Model Context Protocol server that gives Claude weather superpowers.",
    url: "code.charliegleason.com/building-mcp-weather-cloudflare",
  },
  {
    title: "Getting started with Cloudflare Workers for image generation",
    description: "A quick guide to building dynamic Open Graph images on the edge with Cloudflare Workers.",
    url: "code.charliegleason.com/getting-started-cloudflare-workers-image-generation",
  },
  {
    title: "Adding beautiful shaders to your site with paper-design/shaders",
    description: "How to use WebGL on easy mode.",
    url: "code.charliegleason.com/paper-design-shaders",
  },
  {
    title: "Understanding context windows in Claude Code",
    description: "Or how to make the most of your tokens.",
    url: "code.charliegleason.com/understanding-context-windows",
  },
  {
    title: "Side projects and love letters",
    description: "On the value of making things and sharing them.",
    url: "code.charliegleason.com/side-projects-and-love-letters",
  },
];

export const awards = [
  { year: "2024", title: "AWWWARDS, Nomination for Typography Honors, Lysterfield Lake" },
  { year: "2023", title: "AWWWARDS, Honourable Mention, Lysterfield Lake" },
  { year: "2023", title: "Salesforce TMP AI Hackathon, Winner for Overall Best Hack" },
  { year: "2023", title: "Product Hunt, Runner Up in the 2022 Golden Kitty Awards, Pika" },
  { year: "2021", title: "Product Hunt, Featured, Pika" },
  { year: "2019", title: "The Ink Award, Heroku Hanafuda Cards" },
  { year: "2017", title: "Typewolf, Site of the Day, Charlie Gleason" },
  { year: "2016", title: "The FWA, Site of the Day, Kōya" },
  { year: "2016", title: "AWWWARDS, Honourable Mention, Kōya" },
  { year: "2016", title: "Kickstarter, Projects We Love, One For Sorrow, Two For Joy" },
  { year: "2016", title: "The FWA, Site of the Day, Rugby" },
  { year: "2016", title: "AWWWARDS, Honourable Mention, Rugby" },
  { year: "2015", title: "The FWA, Site of the Day, I Will Never Let You Go" },
  { year: "2015", title: "AWWWARDS, Honourable Mention, I Will Never Let You Go" },
  { year: "2015", title: "Chrome Experiments, Tweetflight" },
  { year: "2014", title: "Futurebook Innovation Awards, Best Publisher Website, Unbound" },
  { year: "2013", title: "Google Sandbox, Tweetflight" },
  { year: "2013", title: "The FWA, Site of the Day, Tweetflight" },
  { year: "2013", title: "AWWWARDS, Site of the Day, Tweetflight" },
  { year: "2011", title: "AWWWARDS, Site of the Day, The Story of Mick Roberts" },
  { year: "2011", title: "Caples, Silver, Pop What You're Not" },
  { year: "2011", title: "Award, Bronze, Pop What You're Not" },
  { year: "2010", title: "AIMIA, Nomination for Effectiveness, Pop What You're Not" },
  { year: "2010", title: "ADMA, Bronze for Art Direction / Craft, Pop What You're Not" },
  { year: "2010", title: "ADMA, Silver for Automotive, Pop What You're Not" },
  { year: "2010", title: "MADC, Bronze for Best Microsite, Pop What You're Not" },
  { year: "2007", title: "Design Institute of Australia, Encouragement Award" },
];

export const talks = [
  { year: "2024", title: "Partner Summit: The Future of AppExchange" },
  { year: "2023", title: "Dreamforce: Designing a 5 Star Partner Listing" },
  { year: "2019", title: "Creative Coding London" },
  { year: "2017", title: "JSConf Budapest (Master of Ceremonies)" },
  { year: "2016", title: "Decompress: Blending WebGL and video" },
  { year: "2012", title: "Web Directions South: You are a developer, the internet is your friend" },
  { year: "2012", title: "What Do You Know: So, you are great (and so is Less CSS)" },
  { year: "2011", title: "What Do You Know: How to make your life more awesome with CSS3 media queries" },
];

export const education = [
  {
    degree: "Masters of Computer Science",
    school: "RMIT University, Melbourne",
    years: "2011 - incomplete",
  },
  {
    degree: "Bachelor of Design (Multimedia Design)",
    school: "Swinburne School of Design, Melbourne",
    years: "2004 - 2007",
    note: "First Class Honours",
  },
];

export const certifications = [
  { year: "2022", title: "Salesforce User Experience (UX) Designer Certification" },
];

export const volunteering = [
  { org: "Samaritans", years: "2020 - 2024" },
];

export const races = {
  triathlons: [
    { year: "2023", title: "Blenheim Palace Triathlon (Sprint)" },
    { year: "2022", title: "Blenheim Palace Triathlon (Sprint)" },
  ],
  halfMarathons: [
    { year: "2025", title: "Fremont Quarry Lakes, Alameda, Santa Rosa, San Francisco Presidio, Oakland" },
    { year: "2022", title: "Manchester Great Run" },
    { year: "2021", title: "London Landmarks" },
  ],
  marathons: [
    { year: "2017", title: "London" },
    { year: "2015", title: "London" },
  ],
};

export const contact = [
  { label: "Website", url: "charliegleason.com", icon: "🌐", description: "Main portfolio site" },
  { label: "Writing", url: "code.charliegleason.com", icon: "📝", description: "Code and development blog" },
  { label: "GitHub", url: "github.com/superhighfives", icon: "🐙", description: "@superhighfives" },
  { label: "X", url: "x.com/superhighfives", icon: "🐦", description: "@superhighfives" },
  { label: "Dribbble", url: "dribbble.com/superhighfives", icon: "🏀", description: "@superhighfives" },
  { label: "Email", url: "hello@charliegleason.com", icon: "📧", description: "Get in touch" },
];

export const menuItems = ["About", "Projects", "Writing", "More", "Contact"] as const;
export type MenuItem = (typeof menuItems)[number];

// ── Shared content shape & fallback bundle ────────────────────────────────
//
// Everything above is the build-time fallback: it's what the terminal shows
// offline, or before the first successful fetch, or if charliegleason.com is
// unreachable. At runtime the SSH server pulls the same data from the website
// (see ./store) so editing a project or publishing a post on charliegleason.com
// shows up here too. These types describe that shared shape.

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

export const fallbackContent: Content = {
  bio,
  metadata,
  projects,
  writing,
  awards,
  talks,
  education,
  certifications,
  volunteering,
  races,
  contact,
};
