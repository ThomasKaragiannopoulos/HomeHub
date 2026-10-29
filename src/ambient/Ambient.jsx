import { useEffect, useRef } from "react";
import { FRAG, VERT } from "./shader.js";

const FRAME_MS = 1000 / 30;
const STILL_TIME = 7; // the frame shown when motion is reduced
const SLOW_MS = 55; // a drawn frame slower than this counts as slow
const SLOW_RUN = 30; // this many slow frames in a net run → render at lower resolution
const MIN_SCALE = 0.5;
const DEFAULT_BOOST = 3; // motion intensity; override with ?intensity=<n> (1 = subtle, 10 = extreme)
const W = 1536;
const H = 1024;

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};

// Animated painted backdrop. Lives outside React state: one rAF loop, no re-renders.
export default function Ambient({ src = "/bg.jpg" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    if (!gl) return; // the CSS backdrop underneath stays as the fallback

    let scale = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5);
    const resize = () => {
      canvas.width = Math.round(W * scale);
      canvas.height = Math.round(H * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const boost = Number(new URLSearchParams(window.location.search).get("intensity") ?? DEFAULT_BOOST);
    gl.uniform1f(gl.getUniformLocation(program, "uBoost"), boost);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let loaded = false;
    let time = 0;
    let last = 0;
    let slow = 0;

    const draw = () => {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      if (dt < FRAME_MS) return;
      // Clamped, so resuming after a pause continues smoothly instead of jumping.
      time += Math.min(dt, 100) / 1000;
      last = now;
      // Weak GPU: trade resolution for smoothness instead of stuttering.
      slow = dt > SLOW_MS ? slow + 1 : Math.max(0, slow - 1);
      if (slow > SLOW_RUN && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale * 0.75);
        slow = 0;
        resize();
      }
      draw();
    };

    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!loaded) return;
      // ?t=<seconds> freezes the backdrop at that moment (for deterministic screenshots).
      const fixed = new URLSearchParams(window.location.search).get("t");
      if (fixed !== null || mq.matches) {
        time = fixed !== null ? Number(fixed) : STILL_TIME;
        draw();
      } else if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
      canvas.dataset.running = String(raf !== 0);
    };

    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      loaded = true;
      sync();
    };
    img.src = src;

    document.addEventListener("visibilitychange", sync);
    mq.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", sync);
      mq.removeEventListener("change", sync);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src]);

  return <canvas ref={ref} className="layer ambient" aria-hidden="true" />;
}
