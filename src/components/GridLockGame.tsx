import React, { useMemo, useState, useEffect } from "react"
import "./GridLockGame.css"
import { OuterGrid } from "./OuterGrid"
import { MiddleGrid } from "./MiddleGrid"
import type { Answer, Block, GameState } from "../types/game"
import type { Puzzle } from "../data/puzzles"
import { loadPuzzle, shuffleDeterministic, rng, seedFromString } from "../data/puzzles"
import { PuzzleLoader } from "./PuzzleLoader"

function buildBlocks(tokens: string[], gridId: number): Block[] {
  return tokens.map((text, index) => ({ id: `${gridId}-${index}`, text, gridIndex: gridId, position: index }))
}

function flattenTokens(answerSets: string[][]): string[] {
  return answerSets.flatMap(a => a)
}

function normalizeWord(s: string): string {
  return s.trim().toUpperCase()
}

function arraysEqualUnordered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const aa = [...a].map(normalizeWord).sort()
  const bb = [...b].map(normalizeWord).sort()
  for (let i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) return false
  return true
}

export function GridLockGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)

  const [gameState, setGameState] = useState<GameState>({
    selectedBlocks: [],
    lockedAnswers: [],
    revealedMiddleBlocks: Array(16).fill(false),
    gameComplete: false,
    discoveredOuterCategories: [],
    discoveredFinalCategories: [],
  })
  const [activeGridId, setActiveGridId] = useState<number | null>(null)
  const [wrongFeedback, setWrongFeedback] = useState<boolean[]>([false, false, false, false])
  const [successFeedback, setSuccessFeedback] = useState<boolean[]>([false, false, false, false])
  const [showLoader, setShowLoader] = useState<boolean>(false)

  const boot = (id: string) => {
    loadPuzzle(id)
      .then(data => {
        setPuzzle(data)
        setGameState({
          selectedBlocks: [],
          lockedAnswers: [],
          revealedMiddleBlocks: Array(16).fill(false),
          gameComplete: false,
          discoveredOuterCategories: [],
          discoveredFinalCategories: [],
        })
        const url = new URL(window.location.href)
        url.searchParams.set("p", id)
        window.history.replaceState({}, "", url.toString())
      })
      .catch(err => console.error(err))
  }

  // Load puzzle from query (?p=today) or default 'today'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("p") || "today"
    boot(id)
  }, [])

  // Categories by grid (arrays of 4 parts). Supports:
  // - Categories with precomputed answers (4×4 tokens)
  // - Categories with baseWords (4 words) that we split into 4 chunks each
  function chunkWordIntoFour(word: string, seedStr: string): string[] {
    const w = (word || "").trim()
    const L = w.length
    if (L <= 0) return ["", "", "", ""]
    const rand = rng(seedFromString(seedStr))
    // Randomly choose lengths 1..3 per chunk such that total = L and each remaining chunk stays feasible
    const parts: string[] = []
    let start = 0
    for (let i = 0; i < 4; i++) {
      const remaining = L - start
      const slots = 4 - i
      const minLen = Math.max(1, remaining - (slots - 1) * 3)
      const maxLen = Math.min(3, remaining - (slots - 1) * 1)
      const range = Math.max(1, maxLen - minLen + 1)
      const len = minLen + Math.floor(rand() * range)
      parts.push(w.slice(start, start + len))
      start += len
    }
    return parts
  }

  // Build categories for a given grid index by taking the Nth entry from each category
  function deriveGridCategories(gridIndex: number): string[][] {
    if (!puzzle) return []
    const categories = puzzle.outer || []
    const out: string[][] = []
    for (let c = 0; c < 4; c++) {
      const cat = categories[c]
      if (!cat) continue
      if (cat.answers && Array.isArray(cat.answers) && cat.answers[gridIndex] && cat.answers[gridIndex].length === 4) {
        out.push(cat.answers[gridIndex])
      } else if (cat.baseWords && Array.isArray(cat.baseWords) && typeof cat.baseWords[gridIndex] === "string") {
        const word = cat.baseWords[gridIndex]
        out.push(chunkWordIntoFour(word, `${puzzle.seed}:g${gridIndex + 1}:c${c + 1}:${word}`))
      }
    }
    return out
  }

  const categoriesByGrid: Record<number, string[][]> = useMemo(() => {
    if (!puzzle) return { 1: [], 2: [], 3: [], 4: [] }
    return {
      1: deriveGridCategories(0),
      2: deriveGridCategories(1),
      3: deriveGridCategories(2),
      4: deriveGridCategories(3),
    }
  }, [puzzle])

  // Manage per-grid blocks in state so we can shuffle on demand (seeded)
  const [gridBlocks, setGridBlocks] = useState<Record<number, Block[]>>({ 1: [], 2: [], 3: [], 4: [] })
  useEffect(() => {
    if (!puzzle) return
    const cats1 = deriveGridCategories(0)
    const cats2 = deriveGridCategories(1)
    const cats3 = deriveGridCategories(2)
    const cats4 = deriveGridCategories(3)
    const tokens1 = flattenTokens(cats1)
    const tokens2 = flattenTokens(cats2)
    const tokens3 = flattenTokens(cats3)
    const tokens4 = flattenTokens(cats4)
    const shuffled1 = shuffleDeterministic(tokens1, `${puzzle.seed}-g1`)
    const shuffled2 = shuffleDeterministic(tokens2, `${puzzle.seed}-g2`)
    const shuffled3 = shuffleDeterministic(tokens3, `${puzzle.seed}-g3`)
    const shuffled4 = shuffleDeterministic(tokens4, `${puzzle.seed}-g4`)
    setGridBlocks({
      1: buildBlocks(shuffled1, 1),
      2: buildBlocks(shuffled2, 2),
      3: buildBlocks(shuffled3, 3),
      4: buildBlocks(shuffled4, 4),
    })
  }, [puzzle])

  // Final grid display order (starts shuffled deterministically or provided)
  const [finalOrder, setFinalOrder] = useState<number[]>(Array.from({ length: 16 }, (_, i) => i))
  useEffect(() => {
    if (!puzzle) return
    const order = puzzle.final.finalOrder && puzzle.final.finalOrder.length === 16
      ? [...puzzle.final.finalOrder]
      : shuffleDeterministic(Array.from({ length: 16 }, (_, i) => i), `${puzzle.seed}-final`)
    setFinalOrder(order)
  }, [puzzle])
  const shuffleFinal = () => setFinalOrder(prev => shuffleDeterministic(prev, `${puzzle?.seed || "seed"}-final-reroll-${Date.now()}`))

  // Randomized mapping: which grid reveals which final answer, and chunk order per grid
  // Random mapping design:
  // 1) For each grid, a permutation of labels decides which final label each of its 4 solves contributes to
  // 2) For each final label, a permutation of chunk indices decides which chunk that grid reveals
  const labelPermutationByGrid: Record<number, number[]> = useMemo(() => {
    if (!puzzle) return { 1: [0,1,2,3], 2: [0,1,2,3], 3: [0,1,2,3], 4: [0,1,2,3] }
    return {
      1: shuffleDeterministic([0,1,2,3], `${puzzle.seed}-lbl-perm-g1`),
      2: shuffleDeterministic([0,1,2,3], `${puzzle.seed}-lbl-perm-g2`),
      3: shuffleDeterministic([0,1,2,3], `${puzzle.seed}-lbl-perm-g3`),
      4: shuffleDeterministic([0,1,2,3], `${puzzle.seed}-lbl-perm-g4`),
    }
  }, [puzzle])

  const chunkIndexByLabelGrid: number[][] = useMemo(() => {
    if (!puzzle) return [[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3]]
    const map: number[][] = []
    for (let label = 0; label < 4; label++) {
      const perm = shuffleDeterministic([0,1,2,3], `${puzzle.seed}-chunk-perm-label-${label}`)
      // perm maps chunk order by grid index 0..3; ensure a stable mapping grid->chunk
      // We'll use grid-1 as index to pick the chunk number
      map[label] = perm
    }
    return map
  }, [puzzle])

  // For each (grid, assigned final label), decide which chunk index this grid reveals, based on how many total solves that label already has across all grids
  // We compute this on the fly when revealing, not as a static order per grid.

  const grids = useMemo(() => {
    return [1, 2, 3, 4].map(id => ({ id, blocks: gridBlocks[id], answers: [] }))
  }, [gridBlocks])

  const finalLabels16 = useMemo(() => {
    if (!puzzle) return Array(16).fill("")
    const base = (puzzle.final.labels || []).slice(0, 4)
    const spread: string[] = []
    for (let i = 0; i < 4; i++) {
      const label = base[i] || ""
      const chunks = chunkWordIntoFour(label, `${puzzle.seed}:final:${i + 1}:${label}`)
      spread.push(...chunks)
    }

    while (spread.length < 16) spread.push("")
    return spread
  }, [puzzle])

  // Blocks for final grid (gridIndex 5)
  const finalBlocks: Block[] = useMemo(() => {
    return finalLabels16.map((text, index) => ({ id: `5-${index}`, text, gridIndex: 5, position: index }))
  }, [finalLabels16])

  // Final grid categories (4 answers × 4 chunks each)
  const finalCategories: string[][] = useMemo(() => {
    const cats: string[][] = []
    for (let i = 0; i < 4; i++) cats.push(finalLabels16.slice(i * 4, i * 4 + 4))
    return cats
  }, [finalLabels16])

  const shuffleGrid = (gridId: number) => {
    if (!puzzle) return
    setGridBlocks(prev => ({
      ...prev,
      [gridId]: buildBlocks(
        shuffleDeterministic(prev[gridId].map(b => b.text), `${puzzle.seed}-g${gridId}-reroll-${Date.now()}`),
        gridId
      )
    }))
    // Clear selection if it belonged to this grid to avoid stale ordering
    setGameState(prev => ({ ...prev, selectedBlocks: prev.selectedBlocks.filter(b => b.gridIndex !== gridId) }))
    setActiveGridId(null)
  }

  const isBlockLocked = (gridId: number, blockId: string) =>
    gameState.lockedAnswers
      .some(a => a.category === (gridId === 5 ? "Grid Final" : `Grid ${gridId}`) && a.blocks.some(b => b.id === blockId))

  const swapOuterGridTiles = (gridId: number, blockIdA: string, blockIdB: string) => {
    if (blockIdA === blockIdB) return
    if (isBlockLocked(gridId, blockIdA) || isBlockLocked(gridId, blockIdB)) return
    setGridBlocks(prev => {
      const blocks = [...prev[gridId]]
      const i = blocks.findIndex(b => b.id === blockIdA)
      const j = blocks.findIndex(b => b.id === blockIdB)
      if (i < 0 || j < 0) return prev
      ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
      return { ...prev, [gridId]: blocks }
    })
    setGameState(prev => ({
      ...prev,
      selectedBlocks: prev.selectedBlocks.filter(b => b.gridIndex !== gridId),
    }))
    setActiveGridId(null)
  }

  const swapFinalGridTiles = (dataIdxA: number, dataIdxB: number) => {
    if (dataIdxA === dataIdxB) return
    if (isBlockLocked(5, `5-${dataIdxA}`) || isBlockLocked(5, `5-${dataIdxB}`)) return
    setFinalOrder(prev => {
      const posA = prev.indexOf(dataIdxA)
      const posB = prev.indexOf(dataIdxB)
      if (posA < 0 || posB < 0) return prev
      const next = [...prev]
      ;[next[posA], next[posB]] = [next[posB], next[posA]]
      return next
    })
    setGameState(prev => ({
      ...prev,
      selectedBlocks: prev.selectedBlocks.filter(b => b.gridIndex !== 5),
    }))
    setActiveGridId(null)
  }

  const onToggleSelect = (block: Block) => {
    setGameState(prev => {
      if (prev.selectedBlocks.length > 0 && activeGridId !== null && activeGridId !== block.gridIndex) {
        return prev
      }
      const exists = prev.selectedBlocks.some(b => b.id === block.id)
      let selected = exists ? prev.selectedBlocks.filter(b => b.id !== block.id) : [...prev.selectedBlocks, block]
      if (selected.length > 4) selected = selected.slice(0, 4)
      if (selected.length === 0) {
        setActiveGridId(null)
      } else {
        setActiveGridId(selected[0].gridIndex)
      }
      return { ...prev, selectedBlocks: selected }
    })
  }

  const onSubmitSelection = (gridId: number) => {
    setGameState(prev => {
      if (prev.selectedBlocks.length !== 4) return prev
      if (activeGridId === null || activeGridId !== gridId) return prev
      const allInGrid = prev.selectedBlocks.every(b => b.gridIndex === gridId)
      if (!allInGrid) return prev
      const selectedTexts = prev.selectedBlocks.map(b => b.text)
      const catList = gridId === 5 ? finalCategories : categoriesByGrid[gridId]
      const matchedCategory = catList.find(cat => arraysEqualUnordered(selectedTexts, cat))
      const isCorrect = Boolean(matchedCategory)
      if (!isCorrect) {
        setWrongFeedback(flags => { const next = [...flags]; next[gridId - 1] = true; return next })
        setTimeout(() => { setWrongFeedback(flags => { const next = [...flags]; next[gridId - 1] = false; return next }) }, 500)
        return { ...prev, selectedBlocks: [] }
      }

      const categorySetIndex = catList.findIndex(cat => arraysEqualUnordered(selectedTexts, cat))
      if (categorySetIndex < 0) return prev

      const categoryLabel = gridId === 5 ? `Grid Final` : `Grid ${gridId}`
      const alreadyLocked = prev.lockedAnswers.some(
        a => a.category === categoryLabel && a.categorySetIndex === categorySetIndex
      )
      if (alreadyLocked) return { ...prev, selectedBlocks: [] }

      const isOuter = gridId >= 1 && gridId <= 4
      const discoveredKey = isOuter ? "discoveredOuterCategories" : "discoveredFinalCategories"
      const discovered = [...prev[discoveredKey]]
      if (!discovered.includes(categorySetIndex)) {
        discovered.push(categorySetIndex)
      }

      const newAnswer: Answer = {
        text: (matchedCategory as string[]).join(" "),
        category: categoryLabel,
        blocks: prev.selectedBlocks,
        categorySetIndex,
      }
      const updatedLocked = [...prev.lockedAnswers, newAnswer]

      // Reveal behavior
      const revealed = [...prev.revealedMiddleBlocks]
      if (isOuter) {
        const labelPerm = labelPermutationByGrid[gridId] || [0, 1, 2, 3]
        const labelIdx = labelPerm[categorySetIndex]
        // For that label, choose the chunk index assigned to this grid
        const chunkMap = chunkIndexByLabelGrid[labelIdx] || [0,1,2,3]
        const chunkIdx = chunkMap[(gridId - 1) % 4]
        const revealIndex = labelIdx * 4 + chunkIdx
        if (revealIndex >= 0 && revealIndex < revealed.length) revealed[revealIndex] = true
      } else if (gridId === 5) {
        // For final grid: do not reveal any additional cells (only highlights already present)
      }

      const allRevealed = revealed.filter(Boolean).length >= 16
      setSuccessFeedback(flags => { const n = [...flags]; n[gridId - 1] = true; return n })
      setTimeout(() => { setSuccessFeedback(flags => { const n = [...flags]; n[gridId - 1] = false; return n }) }, 700)
      setActiveGridId(null)
      return {
        ...prev,
        selectedBlocks: [],
        lockedAnswers: updatedLocked,
        revealedMiddleBlocks: revealed,
        gameComplete: allRevealed,
        [discoveredKey]: discovered,
      }
    })
  }

  // Auto-submit when four blocks are selected within the active grid
  useEffect(() => {
    if (gameState.selectedBlocks.length === 4 && activeGridId !== null) {
      onSubmitSelection(activeGridId)
    }
  }, [gameState.selectedBlocks, activeGridId])

  const onClearSelection = (gridId: number) => {
    setGameState(prev => {
      if (activeGridId !== null && activeGridId !== gridId) return prev
      return { ...prev, selectedBlocks: [] }
    })
    setActiveGridId(null)
  }

  if (!puzzle) {
    return <div className="loading">Loading puzzle…</div>
  }

  return (
    <div className="gridlock-game">
      <div className="toolbar">
        <button className="toolbar-btn" onClick={() => setShowLoader(true)}>Set Puzzle</button>
      </div>

      {showLoader && (
        <div className="modal-overlay" onClick={() => setShowLoader(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>Set Puzzle</div>
              <button className="close-btn" onClick={() => setShowLoader(false)}>×</button>
            </div>
            <div className="modal-body">
              <PuzzleLoader onLoad={(id) => { boot(id); setShowLoader(false) }} />
            </div>
          </div>
        </div>
      )}

      <div className="game-grid">
        {grids.map(grid => (
          <OuterGrid
            key={grid.id}
            gridId={grid.id}
            title={`Grid ${grid.id}`}
            blocks={grid.blocks}
            selected={gameState.selectedBlocks}
            lockedAnswers={gameState.lockedAnswers.filter(a => a.category === `Grid ${grid.id}`)}
            discoveredCategories={gameState.discoveredOuterCategories}
            onToggleSelect={onToggleSelect}
            onSubmitSelection={() => onSubmitSelection(grid.id)}
            onClearSelection={() => onClearSelection(grid.id)}
            onShuffle={() => shuffleGrid(grid.id)}
            onSwapTiles={(fromId, toId) => swapOuterGridTiles(grid.id, fromId, toId)}
            disableInteraction={activeGridId !== null && activeGridId !== grid.id}
            wrongFeedback={wrongFeedback[grid.id - 1]}
            successFeedback={successFeedback[grid.id - 1]}
          />
        ))}
      </div>

      <div className="middle-wrap">
        <MiddleGrid
          revealed={gameState.revealedMiddleBlocks}
          order={finalOrder}
          onShuffle={shuffleFinal}
          onSwapTiles={swapFinalGridTiles}
          labels={finalLabels16}
          blocks={finalBlocks}
          onToggleSelect={onToggleSelect}
          onClearSelection={() => setGameState(prev => ({ ...prev, selectedBlocks: prev.selectedBlocks.filter(b => b.gridIndex !== 5) }))}
          selected={gameState.selectedBlocks.filter(b => b.gridIndex === 5)}
          lockedAnswers={gameState.lockedAnswers.filter(a => a.category === `Grid Final`)}
          discoveredCategories={gameState.discoveredFinalCategories}
          gameComplete={gameState.gameComplete}
        />
      </div>
    </div>
  )
}


