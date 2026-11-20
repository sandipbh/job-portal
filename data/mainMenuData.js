import { findJobGroups, findJobPath } from "./findJobsData";

export const homeItems = [
  {
    id: 1,
    items: [
      {
        name: "Home",
        routePath: "/",
      }
    ],
  },
];

export const findJobItems = findJobGroups.map((group) => ({
  id: group.id,
  title: group.title,
  items: group.items.map((entry) => ({
    name: entry.name,
    routePath: findJobPath(entry.slug),
  })),
}));

export const employerItems = [
  {
    id: 2,
    items: [
      {
        name: "Company",
        routePath: "/company",
      }
    ],
  },
];

export const candidateItems = [
  {
    id: 3,
    items: [
      {
        name: "Candidate",
        routePath: "/candidates-list-v1",
      }
    ],
  },
];

export const blogItems = [
  {
    id: 4,
    items: [
      {
        name: "Blogs",
        routePath: "/blog-list-v1",
      }
    ],
  },
];

export const pageItems = [
  {
    name: "About",
    routePath: "/about",
  },
  {
    name: "Pricing",
    routePath: "/pricing",
  },
  {
    name: "FAQ's",
    routePath: "/faq",
  },

  {
    name: "Terms",
    routePath: "/terms",
  },
  {
    name: "Invoice",
    routePath: "/invoice",
  },
  {
    name: "Contact",
    routePath: "/contact",
  },
  {
    name: "404",
    routePath: "/404",
  },
];

