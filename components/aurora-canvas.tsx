"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 mouse = u_mouse / u_resolution;
    mouse.x *= u_resolution.x / u_resolution.y;
    float distMouse = distance(st, mouse);

    float t = u_time * 0.15;

    float n1 = snoise(st * 1.5 + vec2(t * 0.4, t * 0.2));
    float n2 = snoise(st * 3.0 - vec2(t * 0.3, n1 * 0.8));
    float n3 = snoise(st * 5.0 + vec2(n2 * 0.5, t * 0.5));

    vec3 darkBase = vec3(0.02, 0.02, 0.025);
    vec3 slateGlow = vec3(0.06, 0.07, 0.09);
    vec3 orangePrimary = vec3(0.976, 0.45, 0.086);
    vec3 orangeDeep = vec3(0.85, 0.24, 0.02);
    vec3 amberHighlight = vec3(1.0, 0.68, 0.2);

    float curve = sin(st.y * 3.0 + n1 * 2.0 + t) * 0.5 + 0.5;
    float bands = smoothstep(0.0, 0.6, snoise(st * vec2(1.2, 2.4) + vec2(t * 0.25, -t * 0.15)));
    float glowMask = smoothstep(0.3, 0.8, n2 * 0.5 + 0.5) * max(curve, bands * 0.7);

    float mouseInfluence = smoothstep(0.5, 0.0, distMouse) * 0.35;
    glowMask += mouseInfluence;

    vec2 gridUV = fract(st * 18.0) - 0.5;
    float dots = smoothstep(0.06, 0.02, length(gridUV)) * 0.08;

    vec3 color = mix(darkBase, slateGlow, smoothstep(-0.5, 0.8, n1));
    color += mix(orangeDeep, orangePrimary, n3 * 0.5 + 0.5) * glowMask * 0.28;
    color += amberHighlight * pow(glowMask, 3.5) * 0.4;
    color += vec3(dots) * (0.4 + glowMask * 0.6);

    vec2 uvNorm = gl_FragCoord.xy / u_resolution.xy;
    float vignette = uvNorm.x * uvNorm.y * (1.0 - uvNorm.x) * (1.0 - uvNorm.y);
    vignette = clamp(pow(16.0 * vignette, 0.35), 0.0, 1.0);

    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
}`;

export function AuroraCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const syncSize = () => {
      const w = Math.floor(canvas.clientWidth * dpr) || 1;
      const h = Math.floor(canvas.clientHeight * dpr) || 1;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    syncSize();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncSize)
        : null;
    observer?.observe(canvas);

    const compiled: WebGLShader[] = [];
    const compile = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      compiled.push(shader);
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      observer?.disconnect();
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      compiled.forEach((s) => gl.deleteShader(s));
      observer?.disconnect();
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    };
    window.addEventListener("mousemove", onMouseMove);

    const draw = (t: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    if (reducedMotion) {
      syncSize();
      draw(2500);
    } else {
      const render = (t: number) => {
        draw(t);
        raf = requestAnimationFrame(render);
      };
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      compiled.forEach((s) => gl.deleteShader(s));
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
