"use client"

import { Component, type ReactNode } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

const COLORS: [string, string, string, string] = ["#1e1610", "#3a2b1e", "#6b5040", "#d4c4b0"]

class ShaderBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() {
    if (this.state.crashed) return null
    return this.props.children
  }
}

export default function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <ShaderBoundary>
        <MeshGradient
          className="w-full h-full"
          colors={COLORS}
          speed={0.5}
        />
      </ShaderBoundary>
    </div>
  )
}
