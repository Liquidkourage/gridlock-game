import React, { useState, useEffect } from "react"

interface Props {
  onLoad: (puzzleId: string) => void
}

export function PuzzleLoader({ onLoad }: Props) {
  const [simpleId, setSimpleId] = useState("custom")
  const [seed, setSeed] = useState<string>(new Date().toISOString().slice(0, 10))
  // Four input boxes (one per outer grid). Each box should contain 4 lines; each line has 1 base word.
  const [gridBoxes, setGridBoxes] = useState<string[]>(["", "", "", ""]) 
  const [finalLabels, setFinalLabels] = useState<string[]>(["", "", "", ""]) // 4 final grid answers
  const [error, setError] = useState<string | null>(null)

  const DRAFT_KEY = "puzzle_builder_draft_v4"

  const parseTokens = (s: string): string[] => s.split(/[\s,]+/).map(t => t.trim()).filter(Boolean)

  // Restore autosaved draft on mount (support legacy shapes)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (typeof d?.simpleId === "string") setSimpleId(d.simpleId)
        if (typeof d?.seed === "string") setSeed(d.seed)
        if (Array.isArray(d?.gridBoxes) && d.gridBoxes.length === 4) setGridBoxes(d.gridBoxes)
        if (Array.isArray(d?.finalLabels) && d.finalLabels.length === 4) setFinalLabels(d.finalLabels)
        return
      }
      // v3 fallback
      const rawV3 = localStorage.getItem("puzzle_builder_draft_v3")
      if (rawV3) {
        const d = JSON.parse(rawV3)
        if (typeof d?.simpleId === "string") setSimpleId(d.simpleId)
        if (typeof d?.seed === "string") setSeed(d.seed)
        if (Array.isArray(d?.categoryBoxes) && d.categoryBoxes.length === 4) setGridBoxes(d.categoryBoxes)
        if (Array.isArray(d?.finalLabels) && d.finalLabels.length > 0) setFinalLabels([0,1,2,3].map(i => d.finalLabels[i] || ""))
        return
      }
      // v2 fallback
      const rawV2 = localStorage.getItem("puzzle_builder_draft_v2")
      if (rawV2) {
        const d = JSON.parse(rawV2)
        if (typeof d?.simpleId === "string") setSimpleId(d.simpleId)
        if (typeof d?.seed === "string") setSeed(d.seed)
        if (Array.isArray(d?.categoryBoxes) && d.categoryBoxes.length === 4) setGridBoxes(d.categoryBoxes)
        if (typeof d?.finalBox === "string") {
          const tokens = parseTokens(d.finalBox)
          setFinalLabels([0,1,2,3].map(i => tokens[i] || ""))
        }
        return
      }
      const rawV1 = localStorage.getItem("puzzle_builder_draft_v1")
      if (rawV1) {
        const d = JSON.parse(rawV1)
        if (typeof d?.simpleId === "string") setSimpleId(d.simpleId)
        if (typeof d?.seed === "string") setSeed(d.seed)
        if (Array.isArray(d?.categoryBoxes) && d.categoryBoxes.length === 4) setGridBoxes(d.categoryBoxes)
        if (Array.isArray(d?.finalLabels) && d.finalLabels.length > 0) setFinalLabels([0,1,2,3].map(i => d.finalLabels[i] || ""))
      }
    } catch {}
  }, [])

  // Autosave with debounce
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const payload = { simpleId, seed, gridBoxes, finalLabels }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
      } catch {}
    }, 300)
    return () => window.clearTimeout(id)
  }, [simpleId, seed, gridBoxes, finalLabels])

  const buildAndLoad = () => {
    setError(null)
    try {
      // For each grid box: split into up to 4 lines; each line = one base word
      const outer = gridBoxes.map((box, idx) => {
        const lines = box.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        if (lines.length !== 4) throw new Error(`Grid ${idx + 1}: need 4 lines (one base word per line), got ${lines.length}`)
        return { name: `Grid ${idx + 1}`, baseWords: lines }
      })

      const labels = finalLabels.map((l, i) => (l || ``).trim() || `Answer ${i + 1}`)
      if (labels.length !== 4) throw new Error("Final Grid Answers: need 4 answers")

      const puzzle = {
        puzzleId: (simpleId || "custom").trim(),
        date: new Date().toISOString().slice(0, 10),
        seed: seed.trim() || new Date().toISOString().slice(0, 10),
        outer,
        final: { labels }
      }
      sessionStorage.setItem("puzzle:_paste", JSON.stringify(puzzle))
      onLoad("_paste")
    } catch (e: any) {
      setError(e?.message || "Could not build puzzle")
    }
  }

  return (
    <div className="puzzle-loader" style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 700, color: "#ccc" }}>Simple Builder</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="puzzle id (custom)" value={simpleId} onChange={e => setSimpleId(e.target.value)} />
        <input placeholder="seed (defaults to date)" value={seed} onChange={e => setSeed(e.target.value)} />
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
        {gridBoxes.map((v, i) => (
          <div key={i} style={{ display: "grid", gap: 6 }}>
            <div style={{ color: "#bbb", fontWeight: 600 }}>Grid {i + 1}</div>
            <textarea
              rows={6}
              placeholder={`4 lines. Each line = one base word.`}
              value={v}
              onChange={e => setGridBoxes(prev => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
            />
          </div>
        ))}
      </div>

      <div style={{ color: "#bbb", fontWeight: 600 }}>Final Grid Answers (4)</div>
      <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        {finalLabels.map((l, i) => (
          <input key={i} placeholder={`Answer ${i + 1}`} value={l} onChange={e => setFinalLabels(prev => prev.map((x, idx) => (idx === i ? e.target.value : x)))} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={buildAndLoad}>Build & Load</button>
      </div>

      {error && <div style={{ color: "#f88" }}>{error}</div>}
    </div>
  )
}
