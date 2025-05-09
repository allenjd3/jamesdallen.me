import rss from '@astrojs/rss'
import { getCollection } from 'astro:content';

export async function GET(context) {
	const blog = await getCollection('blog');

	return rss({
		title: 'James Allen\'s Blog',
		description: 'Hi! I\'m James, a former Hospital Laboratory supervisor who traded microscopes and test tubes for PHP and the TALL stack. Since 2021, I’ve been diving into the world of web development with the same passion I once used to analyze lab results. Today, I work with PHP, Laravel, and the TALL stack, crafting clean, functional code.',
		site: context.site,
		items: blog.map((post) => ({
			title: post.data.title,
			pubDate: post.data.published_at,
			description: post.data.description,
			link: `/blog/${post.slug}`
		})),
	});
}
