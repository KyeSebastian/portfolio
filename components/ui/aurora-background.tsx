"use client"

import { useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const AuroraShader = () => {
  const { scene } = useThree()

  useEffect(() => {
    const geometry = new THREE.PlaneGeometry(200, 200)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time:       { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2  resolution;
        varying vec2  vUv;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m * m; m = m * m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = vUv;

          float flow1 = snoise(vec2(uv.x * 2.0  + time * 0.06,  uv.y * 0.5 + time * 0.03));
          float flow2 = snoise(vec2(uv.x * 1.5  + time * 0.05,  uv.y * 0.8 + time * 0.02));
          float flow3 = snoise(vec2(uv.x * 3.0  + time * 0.07,  uv.y * 0.3 + time * 0.04));

          float streaks = sin((uv.x + flow1 * 0.3) * 6.0 + time * 0.12) * 0.5 + 0.5;
          streaks      *= sin((uv.y + flow2 * 0.2) * 9.0 + time * 0.09) * 0.5 + 0.5;

          float aurora = (flow1 + flow2 + flow3) * 0.33 + 0.5;
          aurora = pow(aurora, 2.2);

          // ── Landing page palette ───────────────────────────────────────────
          vec3 deepEspresso = vec3(0.078, 0.063, 0.031); // #141008
          vec3 darkBrown    = vec3(0.165, 0.122, 0.078); // #2a1f14
          vec3 caramel      = vec3(0.290, 0.220, 0.157); // #4a3828
          vec3 cream        = vec3(0.910, 0.867, 0.816); // #e8ddd0

          vec3 color = deepEspresso;

          float warmFlow = smoothstep(0.20, 0.60, aurora + streaks * 0.3);
          color = mix(color, darkBrown, warmFlow);

          float caramelFlow = smoothstep(0.45, 0.75, aurora + flow1 * 0.4);
          color = mix(color, caramel, caramelFlow * 0.9);

          float creamFlow = smoothstep(0.72, 0.97, streaks + aurora * 0.5);
          color = mix(color, cream, creamFlow * 0.18);

          float noise = snoise(uv * 80.0) * 0.012;
          color += noise;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.z = -50
    scene.add(mesh)

    let animId: number
    const animate = () => {
      material.uniforms.time.value += 0.008
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
    }
  }, [scene])

  return null
}

const CameraController = () => {
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.04) * 2
    camera.position.y = Math.cos(t * 0.05) * 1.5
    camera.position.z = 30
    camera.lookAt(0, 0, -30)
  })
  return null
}

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <AuroraShader />
        <CameraController />
      </Canvas>
    </div>
  )
}
