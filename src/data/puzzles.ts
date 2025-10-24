export interface Puzzle {
  puzzleId: string
  date: string
  seed: string
  // Each outer grid can provide either:
  // - answers: precomputed 4 categories × 4 tokens each (legacy), or
  // - baseWords: 4 words to be split into 4 chunks each at runtime
  outer: { name?: string; answers?: string[][]; baseWords?: string[] }[]
  final: { labels: string[]; finalWord: string; finalOrder?: number[] }
}

export async function loadPuzzle(puzzleId: string): Promise<Puzzle> {
  if (puzzleId === "_paste") {
    const raw = sessionStorage.getItem("puzzle:_paste")
    if (!raw) throw new Error("No pasted puzzle in sessionStorage")
    return normalizePuzzle(JSON.parse(raw) as Puzzle)
  }
  const res = await fetch(`/puzzles/${puzzleId}.json`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to load puzzle ${puzzleId}`)
  const data = (await res.json()) as Puzzle
  return normalizePuzzle(data)
}

// Simple deterministic RNG (Mulberry32)
export function rng(seed: number) {
  let t = seed >>> 0
  return function() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shuffleDeterministic<T>(arr: T[], seedStr: string): T[] {
  const r = rng(seedFromString(seedStr))
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function normalizeToken(s: string): string {
  return (s || "").replace(/\s+/g, "").toUpperCase()
}

function normalizePuzzle(p: Puzzle): Puzzle {
  const outer = (p.outer || []).map(g => {
    const name = g.name
    if (g.answers && Array.isArray(g.answers)) {
      const answers = g.answers.map(set => set.map(normalizeToken))
      return { name, answers }
    }
    if (g.baseWords && Array.isArray(g.baseWords)) {
      const baseWords = g.baseWords.map(normalizeToken)
      return { name, baseWords }
    }
    return { name, answers: [] as string[][] }
  })

  const final = {
    labels: (p.final?.labels || []).map(normalizeToken),
    finalWord: normalizeToken(p.final?.finalWord || ""),
    finalOrder: p.final?.finalOrder ? [...p.final.finalOrder] : undefined,
  }

  return {
    puzzleId: p.puzzleId,
    date: p.date,
    seed: p.seed,
    outer,
    final,
  }
}
