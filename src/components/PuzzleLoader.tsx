import React, { useState, useEffect } from "react"
import { listSavedDailyPuzzleIds, saveDailyPuzzle, type Puzzle } from "../data/puzzles"

interface Props {
  onLoad: (puzzleId: string) => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function PuzzleLoader({ onLoad }: Props) {
  const [puzzleDate, setPuzzleDate] = useState(todayISO())
  const [seed, setSeed] = useState(todayISO())
  const [gridBoxes, setGridBoxes] = useState<string[]>(["", "", "", ""])
  const [categoryNames, setCategoryNames] = useState<string[]>(["", "", "", ""])
  const [savedDays, setSavedDays] = useState<string[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const DRAFT_KEY = "puzzle_builder_draft_v5"

  const refreshSaved = () => setSavedDays(listSavedDailyPuzzleIds())

  useEffect(() => {
    refreshSaved()
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      if (typeof d?.puzzleDate === "string") setPuzzleDate(d.puzzleDate)
      else if (typeof d?.simpleId === "string") setPuzzleDate(d.simpleId)
      if (typeof d?.seed === "string") setSeed(d.seed)
      if (Array.isArray(d?.gridBoxes) && d.gridBoxes.length === 4) setGridBoxes(d.gridBoxes)
      if (Array.isArray(d?.categoryNames) && d.categoryNames.length === 4) setCategoryNames(d.categoryNames)
    } catch {}
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ puzzleDate, seed, gridBoxes, categoryNames })
        )
      } catch {}
    }, 300)
    return () => window.clearTimeout(id)
  }, [puzzleDate, seed, gridBoxes, categoryNames])

  const loadSavedDay = (day: string) => {
    setError(null)
    setStatus(null)
    try {
      const raw = localStorage.getItem(`puzzle:${day}`)
      if (!raw) throw new Error(`No saved puzzle for ${day}`)
      const p = JSON.parse(raw) as Puzzle
      setPuzzleDate(p.date || day)
      setSeed(p.seed || day)
      setCategoryNames([0, 1, 2, 3].map(i => p.outer[i]?.name || ""))
      setGridBoxes(
        [0, 1, 2, 3].map(i => {
          const words = p.outer[i]?.baseWords
          if (words?.length) return words.join("\n")
          const answers = p.outer[i]?.answers
          if (answers?.length) return answers.map(a => a.join("")).join("\n")
          return ""
        })
      )
      setStatus(`Loaded draft for ${day}`)
    } catch (e: any) {
      setError(e?.message || "Could not load saved day")
    }
  }

  const buildPuzzle = (): Puzzle => {
    const day = (puzzleDate || todayISO()).trim()
    const outer = gridBoxes.map((box, idx) => {
      const lines = box.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      if (lines.length !== 4) {
        throw new Error(`Grid ${idx + 1}: need 4 lines (one base word per line), got ${lines.length}`)
      }
      return { name: `Grid ${idx + 1}`, baseWords: lines }
    })
    const names = categoryNames.map((l, i) => (l || "").trim() || `Category ${i + 1}`)
    return {
      puzzleId: day,
      date: day,
      seed: seed.trim() || day,
      outer: outer.map((g, i) => ({ ...g, name: names[i] })),
    }
  }

  const saveForDay = () => {
    setError(null)
    setStatus(null)
    try {
      const puzzle = buildPuzzle()
      saveDailyPuzzle(puzzle)
      refreshSaved()
      setStatus(`Saved puzzle for ${puzzle.date}`)
    } catch (e: any) {
      setError(e?.message || "Could not save puzzle")
    }
  }

  const saveAndPlay = () => {
    setError(null)
    setStatus(null)
    try {
      const puzzle = buildPuzzle()
      saveDailyPuzzle(puzzle)
      refreshSaved()
      onLoad(puzzle.puzzleId)
    } catch (e: any) {
      setError(e?.message || "Could not build puzzle")
    }
  }

  return (
    <div className="puzzle-loader" style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 700, color: "#ccc" }}>Daily Puzzle Builder</div>
      <p style={{ color: "#9a9890", margin: 0, fontSize: "0.9rem" }}>
        Pick a date, enter four category names and four grids (4 words each). Save for that day, then play it.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
        <label style={{ display: "grid", gap: 4, color: "#bbb", fontWeight: 600 }}>
          Puzzle day
          <input type="date" value={puzzleDate} onChange={e => setPuzzleDate(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 4, color: "#bbb", fontWeight: 600, flex: "1 1 140px" }}>
          Seed
          <input placeholder="defaults to date" value={seed} onChange={e => setSeed(e.target.value)} />
        </label>
      </div>

      {savedDays.length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ color: "#bbb", fontWeight: 600 }}>Saved days</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {savedDays.slice(0, 12).map(day => (
              <button key={day} type="button" className="day-chip" onClick={() => loadSavedDay(day)}>
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

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

      <div style={{ color: "#bbb", fontWeight: 600 }}>Category Names (4)</div>
      <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        {categoryNames.map((l, i) => (
          <input
            key={i}
            placeholder={`Category ${i + 1}`}
            value={l}
            onChange={e => setCategoryNames(prev => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" onClick={saveForDay}>Save for Day</button>
        <button type="button" onClick={saveAndPlay}>Save & Play</button>
      </div>

      {status && <div style={{ color: "#9be59b" }}>{status}</div>}
      {error && <div style={{ color: "#f88" }}>{error}</div>}
    </div>
  )
}
