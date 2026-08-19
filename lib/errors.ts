import fs from "fs"
import path from "path"
import { markdownToHtml } from "@/lib/markdown"

const ERRORS_FILE = path.join(process.cwd(), "content/errors/Error Journal.md")

export async function getErrorJournalHtml(): Promise<string> {
  const raw = fs.readFileSync(ERRORS_FILE, "utf8")
  return markdownToHtml(raw)
}
