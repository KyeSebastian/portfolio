"use client"

import { MeshGradient } from "@paper-design/shaders-react"

export default function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <MeshGradient
        className="w-full h-full"
        colors={["#141008", "#2a1f14", "#4a3828", "#e8ddd0"]}
        speed={0.5}
      />
    </div>
  )
}
