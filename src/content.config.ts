import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const postCollection = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedDate: z.string().transform((str) => new Date(str)),
    tags: z.array(z.string()),
    thumbnail: z.string().optional(),
    published: z.boolean().default(true),
  }),
});
const navCollection = defineCollection({
  loader: glob({ base: "./src/content/nav", pattern: "**/*.{yaml,yml}" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    order: z.number(),
    match: z.union([z.literal("exact"), z.literal("prefix")]),
  }),
});
const experienceCollection = defineCollection({
  loader: glob({
    base: "./src/content/experience",
    pattern: "**/*.{yaml,yml}",
  }),
  schema: z.object({
    type: z.union([
      z.literal("work"),
      z.literal("education"),
      z.literal("volunteer"),
    ]),
    where: z.string(),
    what: z.string(),
    whatArticle: z.string(),
    whenStart: z.string().transform((str) => new Date(str)),
    whenEnd: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
  }),
});

const linksCollection = defineCollection({
  loader: glob({ base: "./src/content/links", pattern: "**/*.{yaml,yml}" }),
  schema: z.object({
    title: z.string(),
    url: z.string().optional(),
    site: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  posts: postCollection,
  nav: navCollection,
  experience: experienceCollection,
  links: linksCollection,
};
