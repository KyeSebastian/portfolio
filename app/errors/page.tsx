import { BlogHeader } from "@/components/ui/blog-header"
import { getErrorJournalHtml } from "@/lib/errors"

export const metadata = {
  title: "Errors - Kye Mora",
  description: "Every mistake made building the home lab, and how it got fixed.",
}

export default async function ErrorsPage() {
  const html = await getErrorJournalHtml()

  return (
    <>
      <BlogHeader />
      <main className="px-6 sm:px-10 pb-24">
        <div
          className="prose prose-invert prose-p:text-cream/75 prose-headings:text-cream/90 prose-headings:font-light prose-strong:text-cream/90 prose-a:text-cream prose-code:text-cream/90 prose-hr:border-cream/10 max-w-2xl mx-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </>
  )
}
