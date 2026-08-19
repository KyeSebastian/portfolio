import fs from "fs"
import path from "path"
import { markdownToHtml } from "@/lib/markdown"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export type PostMeta = {
  slug: string
  order: number
  title: string
  excerpt: string
}

function slugFor(order: number) {
  return `build-log-${String(order).padStart(2, "0")}`
}

function parseFile(filename: string) {
  const match = filename.match(/^Build Log (\d+)/)
  const order = match ? parseInt(match[1], 10) : 0
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8")
  const lines = raw.split("\n")

  // First line is "# Build Log 0N: Title", strip the prefix for a clean display title
  const titleLine = lines[0].replace(/^#\s*/, "")
  const title = titleLine.replace(/^Build Log \d+:\s*/, "")

  const body = lines.slice(1).join("\n").trim()

  return { order, title, body }
}

function makeExcerpt(body: string): string {
  // First real paragraph after "## The Goal" (or the first paragraph if that heading isn't found)
  const goalIndex = body.indexOf("## The Goal")
  const searchFrom = goalIndex === -1 ? 0 : goalIndex
  const afterHeading = body.slice(searchFrom).split("\n").filter((l) => l.trim().length > 0)
  const firstParagraph = afterHeading.find((l) => !l.startsWith("#"))
  if (!firstParagraph) return ""

  const plain = firstParagraph
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // strip markdown links, keep text
    .replace(/`([^`]+)`/g, "$1") // strip inline code backticks
    .trim()

  return plain.length > 220 ? plain.slice(0, 217).trimEnd() + "..." : plain
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
  return files
    .map((filename) => {
      const { order, title, body } = parseFile(filename)
      return {
        slug: slugFor(order),
        order,
        title,
        excerpt: makeExcerpt(body),
      }
    })
    .sort((a, b) => a.order - b.order)
}

export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; html: string } | null> {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
  const filename = files.find((f) => {
    const match = f.match(/^Build Log (\d+)/)
    const order = match ? parseInt(match[1], 10) : 0
    return slugFor(order) === slug
  })
  if (!filename) return null

  const { order, title, body } = parseFile(filename)
  const html = await markdownToHtml(body)

  return {
    meta: { slug, order, title, excerpt: makeExcerpt(body) },
    html,
  }
}
