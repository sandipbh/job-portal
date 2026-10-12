// kind decides which public search API resolves the term:
// category -> industry search, keyword -> keyword search, location -> location search
const item = (kind, name, term) => ({
  name,
  term,
  kind,
  slug: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""),
});

export const findJobGroups = [
  {
    id: 1,
    title: "Popular categories",
    items: [
      item("category", "IT jobs", "IT"),
      item("category", "Sales jobs", "Sales"),
      item("category", "Marketing jobs", "Marketing"),
      item("category", "Data Science jobs", "Data Science"),
      item("category", "HR jobs", "HR"),
      item("category", "Engineering jobs", "Engineering"),
    ],
  },
  {
    id: 2,
    title: "Jobs in demand",
    items: [
      item("keyword", "Fresher jobs", "Fresher"),
      item("keyword", "MNC jobs", "MNC"),
      item("keyword", "Remote jobs", "Remote"),
      item("keyword", "Work from home jobs", "Work from home"),
      item("keyword", "Walk-in jobs", "Walk-in"),
      item("keyword", "Part-time jobs", "Part-time"),
    ],
  },
  {
    id: 3,
    title: "Jobs by location",
    items: [
      item("location", "Jobs in Delhi", "Delhi"),
      item("location", "Jobs in Mumbai", "Mumbai"),
      item("location", "Jobs in Bangalore", "Bangalore"),
      item("location", "Jobs in Hyderabad", "Hyderabad"),
      item("location", "Jobs in Chennai", "Chennai"),
      item("location", "Jobs in Pune", "Pune"),
    ],
  },
];

export const findJobPath = (slug) => `/find-jobs/${slug}`;

export const getFindJobBySlug = (slug) =>
  findJobGroups.flatMap((group) => group.items).find((entry) => entry.slug === slug) ||
  null;
