/**
 * Живой фон hero: собственный silk-шейдер на WebGL2.
 * Один fullscreen quad, без Three.js/R3F.
 * — DPR ≤1.5 на десктопе, ≤1 на мобиле; 60/30 fps;
 * — пауза вне вьюпорта и в скрытой вкладке;
 * — при prefers-reduced-motion или потере контекста canvas удаляется,
 *   остаётся CSS-fallback (см. SilkBackground.astro).
 */

const VERT = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Монохромный silk: доменный warp через итеративные sin/cos (классическая
// техника "Silky" на шейдертой, переписанная под ч/б палитру проекта).
// MAX_ITER 4 — компромисс цены и картинки (пятая итерация почти не видна).
const FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

out vec4 fragColor;

#define TAU 6.28318530718
#define MAX_ITER 4

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

  vec2 shifted = uv + u_pointer * 0.08;
  vec2 p = mod(shifted * TAU, TAU) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;

  for (int n = 0; n < MAX_ITER; n++) {
    float t = u_time * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }

  c /= float(MAX_ITER);
  c = 1.17 - pow(c, 1.4);
  float v = clamp(pow(abs(c), 8.0), 0.0, 1.0);

  vec3 col = vec3(v);
  // тёмный центр, яркие волны по краям — как на референсе
  col *= smoothstep(0.10, 0.95, abs(uv.x));
  // виньетка по краям кадра
  col *= smoothstep(1.7, 0.35, length(uv));
  col *= 0.8;
  // мягкий световой столб в центре (луч под CTA)
  col += vec3(0.06) * smoothstep(0.8, 0.0, abs(uv.x)) * smoothstep(1.35, -0.35, uv.y);

  fragColor = vec4(col, 1.0);
}`;

export function initSilk(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-silk]");
  if (!canvas) return;

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });

  if (reducedQuery.matches || !gl) {
    canvas.remove();
    return;
  }

  let program: WebGLProgram;
  try {
    const compile = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? "compile");
      }
      return shader;
    };

    program = gl.createProgram();
    if (!program) throw new Error("program");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "link");
    }
  } catch {
    canvas.remove();
    return;
  }

  gl.useProgram(program);

  // Один треугольник, покрывающий весь экран
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const attrib = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(attrib);
  gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uPointer = gl.getUniformLocation(program, "u_pointer");

  const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const frameMs = coarse ? 1000 / 30 : 1000 / 60;

  // Сниженная внутренняя плотность рендера: эффект мягкий, апскейл незаметен,
  // а количество фрагментов (и цена шейдера) падает в несколько раз.
  let renderScale = coarse ? 0.5 : 0.66;

  let width = 0;
  let height = 0;
  const resize = () => {
    // DPR 1: silk — размытая текстура, повышенная плотность не видна
    const w = Math.max(1, Math.round(canvas.clientWidth * renderScale));
    const h = Math.max(1, Math.round(canvas.clientHeight * renderScale));
    if (w === width && h === height) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  const onPointer = (event: PointerEvent) => {
    targetX = (event.clientX / window.innerWidth) * 2 - 1;
    targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };
  if (!coarse) {
    window.addEventListener("pointermove", onPointer, { passive: true });
  }

  let running = false;
  let raf = 0;
  let last = performance.now();
  let accumulated = 0;
  let time = 0;
  let visible = true;

  // Адаптивное качество: если fps стабильно низкий — снижаем плотность один раз
  let perfWindow = 0;
  let perfFrames = 0;
  let perfLast = performance.now();

  const frame = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = now;
      perfLast = now;
      return;
    }
    const delta = now - last;
    last = now;
    accumulated += delta;
    if (accumulated < frameMs) return;
    time += accumulated / 1000;
    accumulated = 0;

    // контроль fps (окно ~2 c)
    perfFrames += 1;
    perfWindow = now - perfLast;
    if (perfWindow >= 2000) {
      const fps = (perfFrames * 1000) / perfWindow;
      perfFrames = 0;
      perfLast = now;
      if (fps < 45 && renderScale > 0.4) {
        renderScale = Math.max(0.4, renderScale * 0.75);
        resize();
      }
    }

    pointerX += (targetX - pointerX) * 0.06;
    pointerY += (targetY - pointerY) * 0.06;

    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uPointer, pointerX, pointerY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    },
    { rootMargin: "120px" },
  );
  intersectionObserver.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
    canvas.remove();
  });

  reducedQuery.addEventListener?.("change", () => {
    if (reducedQuery.matches) {
      stop();
      canvas.remove();
    }
  });

  start();
}
