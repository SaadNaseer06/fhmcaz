import { site } from '../data/site';

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export async function fetchPosts(perPage = 100): Promise<WpPost[]> {
  const urls = [
    site.wpApi,
    'http://localhost/fhmcaz/blog/wp-json/wp/v2',
    'http://localhost/fhmcaz/wp-json/wp/v2',
  ];

  for (const base of urls) {
    try {
      const res = await fetch(
        `${base}/posts?per_page=${perPage}&_embed=1&status=publish`,
      );
      if (!res.ok) continue;
      return (await res.json()) as WpPost[];
    } catch {
      // try next base
    }
  }
  return [];
}

export async function fetchPostBySlug(slug: string): Promise<WpPost | null> {
  const posts = await fetchPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export function postCard(post: WpPost) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  return {
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    date: new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    image: media?.source_url,
    alt: media?.alt_text || stripHtml(post.title.rendered),
  };
}
