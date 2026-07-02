import {
  homeItems,
  findJobItems,
  employerItems,
  candidateItems,
  blogItems,
  pageItems,
  shopItems,
} from "../data/mainMenuData";

export const mobileMenuData = [
  // Home (no submenu)
  {
    id: 1,
    single: true,
    name: homeItems[0].items[0].name,
    routePath: homeItems[0].items[0].routePath,
  },

  // Find Jobs
  {
    id: 2,
    label: "Find Jobs",
    items: findJobItems,
  },

  // Employers
  {
    id: 3,
    label: "Employers",
    items: employerItems,
  },

  // Candidates
  {
    id: 4,
    label: "Candidates",
    items: candidateItems,
  },

  // Blog
  {
    id: 5,
    label: "Blog",
    items: [
      {
        id: 1,
        title: "Blog",
        items: blogItems,
      },
    ],
  },

  // Pages
  {
    id: 6,
    label: "Pages",
    items: [
      {
        id: 1,
        title: "Pages",
        items: pageItems,
      },
    ],
  },

  // Shop
  {
    id: 7,
    label: "Shop",
    items: shopItems,
  },
];