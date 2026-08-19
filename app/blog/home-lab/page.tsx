import Link from "next/link"
import { BlogHeader } from "@/components/ui/blog-header"
import { getAllPosts } from "@/lib/blog"

export const metadata = {
  title: "Break It Until It Works - Kye Mora",
  description: "A build log of a virtualized network security lab, written up as it happened, mistakes included.",
}

export default function HomeLabTocPage() {
  const posts = getAllPosts()

  return (
    <>
      <BlogHeader />
      <main className="px-6 sm:px-10 pb-24">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-cream/60 uppercase mb-3">
            Home Lab
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-cream/90 mb-4">
            Break It Until It Works.
          </h1>
          <p className="text-cream/60 mb-12 leading-relaxed">
            A build log of a virtualized network security lab, written up as it happened.
            Almost nothing worked on the first try. Every entry below is what actually
            broke, why, and how it got fixed.
          </p>

          <p className="font-mono text-xs tracking-widest text-cream/45 uppercase mb-4">
            Contents
          </p>
          <ol className="flex flex-col gap-8">
            {posts.map((post) => (
              <li key={post.slug} className="border-b border-cream/10 pb-8 last:border-0">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <p className="font-mono text-xs tracking-widest text-cream/45 uppercase mb-2">
                    Build Log {String(post.order).padStart(2, "0")}
                  </p>
                  <h2 className="text-xl text-cream/90 group-hover:text-cream transition-colors duration-200 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-cream/55 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <Link
              href="/errors"
              className="font-mono text-xs tracking-widest uppercase text-cream/45 hover:text-cream/90 transition-colors duration-200"
            >
              Every mistake, documented
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
