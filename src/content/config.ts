import {defineCollection, z} from "astro:content";
const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        img: z.string(),
        published_at: z.string(),
        category: z.string(),
        description: z.string(),
        keywords: z.string(),
        photo_attribution: z.string(),
    })
})

export const collections = {
    'blog': blogCollection,
}
