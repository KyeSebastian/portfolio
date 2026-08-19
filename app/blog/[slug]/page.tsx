import { notFound } from "next/navigation"
import { BlogHeader } from "@/components/ui/blog-header"
import { getAllPosts, getPostBySlug } from "@/lib/blog"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.meta.title} - Kye Mora`,
    description: post.meta.excerpt,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <BlogHeader />
      <main className="px-6 sm:px-10 pb-24">
        <article className="mx-auto max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-cream/45 uppercase mb-3">
            Build Log {String(post.meta.order).padStart(2, "0")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-cream/90 mb-10">
            {post.meta.title}
          </h1>
          <div
            className="prose prose-invert prose-p:text-cream/75 prose-headings:text-cream/90 prose-headings:font-light prose-strong:text-cream/90 prose-a:text-cream prose-code:text-cream/90 prose-hr:border-cream/10 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </main>
    </>
  )
}
