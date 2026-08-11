import React, { useMemo, useState, useEffect } from "react"
import "./GridLockGame.css"
import { OuterGrid } from "./OuterGrid"
import { CategoryReveal } from "./CategoryReveal"
import type { Answer, Block, GameState } from "../types/game"
import type { Puzzle } from "../data/puzzles"
import { loadPuzzle, shuffleDeterministic, rng, seedFromString } from "../data/puzzles"
import { allCategorySetsComplete, getCategoryName } from "../utils/categorySets"

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
    gameComplete: false,
    discoveredOuterCategories: [],
  })
  const [activeGridId, setActiveGridId] = useState<number | null>(null)
  const [wrongFeedback, setWrongFeedback] = useState<boolean[]>([false, false, false, false])
  const [successFeedback, setSuccessFeedback] = useState<boolean[]>([false, false, false, false])
  const boot = (id: string) => {
    loadPuzzle(id)
      .then(data => {
        setPuzzle(data)
        setGameState({
          selectedBlocks: [],
          lockedAnswers: [],
          gameComplete: false,
          discoveredOuterCategories: [],
        })
        const url = new URL(window.location.href)
        url.searchParams.set("p", id)
        window.history.replaceState({}, "", url.toString())
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("p") || "today"
    boot(id)
  }, [])

  function chunkWordIntoFour(word: string, seedStr: string): string[] {
    // Strip punctuation so "High-sticking" → HIGHSTICKING (12 letters), not 13 chars
    const w = (word || "").toUpperCase().replace(/[^A-Z0-9]/g, "")
    const L = w.length
    if (L <= 0) return ["", "", "", ""]
    const rand = rng(seedFromString(seedStr))
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

  const categoryNames = useMemo(() => {
    if (!puzzle) return ["", "", "", ""]
    return [0, 1, 2, 3].map(i => getCategoryName(puzzle, i))
  }, [puzzle])

  const [gridBlocks, setGridBlocks] = useState<Record<number, Block[]>>({ 1: [], 2: [], 3: [], 4: [] })
  useEffect(() => {
    if (!puzzle) return
    const tokens1 = flattenTokens(deriveGridCategories(0))
    const tokens2 = flattenTokens(deriveGridCategories(1))
    const tokens3 = flattenTokens(deriveGridCategories(2))
    const tokens4 = flattenTokens(deriveGridCategories(3))
    setGridBlocks({
      1: buildBlocks(shuffleDeterministic(tokens1, `${puzzle.seed}-g1`), 1),
      2: buildBlocks(shuffleDeterministic(tokens2, `${puzzle.seed}-g2`), 2),
      3: buildBlocks(shuffleDeterministic(tokens3, `${puzzle.seed}-g3`), 3),
      4: buildBlocks(shuffleDeterministic(tokens4, `${puzzle.seed}-g4`), 4),
    })
  }, [puzzle])

  const grids = useMemo(() => {
    return [1, 2, 3, 4].map(id => ({ id, blocks: gridBlocks[id] }))
  }, [gridBlocks])

  const shuffleGrid = (gridId: number) => {
    if (!puzzle) return
    setGridBlocks(prev => ({
      ...prev,
      [gridId]: buildBlocks(
        shuffleDeterministic(prev[gridId].map(b => b.text), `${puzzle.seed}-g${gridId}-reroll-${Date.now()}`),
        gridId
      )
    }))
    setGameState(prev => ({ ...prev, selectedBlocks: prev.selectedBlocks.filter(b => b.gridIndex !== gridId) }))
    setActiveGridId(null)
  }

  const isBlockLocked = (gridId: number, blockId: string) =>
    gameState.lockedAnswers
      .some(a => a.category === `Grid ${gridId}` && a.blocks.some(b => b.id === blockId))

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
      const catList = categoriesByGrid[gridId]
      const matchedCategory = catList.find(cat => arraysEqualUnordered(selectedTexts, cat))
      const isCorrect = Boolean(matchedCategory)
      if (!isCorrect) {
        setWrongFeedback(flags => { const next = [...flags]; next[gridId - 1] = true; return next })
        setTimeout(() => { setWrongFeedback(flags => { const next = [...flags]; next[gridId - 1] = false; return next }) }, 500)
        return { ...prev, selectedBlocks: [] }
      }

      const categorySetIndex = catList.findIndex(cat => arraysEqualUnordered(selectedTexts, cat))
      if (categorySetIndex < 0) return prev

      const categoryLabel = `Grid ${gridId}`
      const alreadyLocked = prev.lockedAnswers.some(
        a => a.category === categoryLabel && a.categorySetIndex === categorySetIndex
      )
      if (alreadyLocked) return { ...prev, selectedBlocks: [] }

      const discovered = [...prev.discoveredOuterCategories]
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

      setSuccessFeedback(flags => { const n = [...flags]; n[gridId - 1] = true; return n })
      setTimeout(() => { setSuccessFeedback(flags => { const n = [...flags]; n[gridId - 1] = false; return n }) }, 700)
      setActiveGridId(null)
      return {
        ...prev,
        selectedBlocks: [],
        lockedAnswers: updatedLocked,
        gameComplete: allCategorySetsComplete(updatedLocked),
        discoveredOuterCategories: discovered,
      }
    })
  }

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
      <div className="play-layout">
        {grids.map(grid => (
          <div key={grid.id} className="play-cell">
            <OuterGrid
              gridId={grid.id}
              title={`Grid ${grid.id}`}
              blocks={grid.blocks}
              selected={gameState.selectedBlocks}
              lockedAnswers={gameState.lockedAnswers.filter(a => a.category === `Grid ${grid.id}`)}
              discoveredCategories={gameState.discoveredOuterCategories}
              onToggleSelect={onToggleSelect}
              onClearSelection={() => onClearSelection(grid.id)}
              onShuffle={() => shuffleGrid(grid.id)}
              onSwapTiles={(fromId, toId) => swapOuterGridTiles(grid.id, fromId, toId)}
              disableInteraction={activeGridId !== null && activeGridId !== grid.id}
              wrongFeedback={wrongFeedback[grid.id - 1]}
              successFeedback={successFeedback[grid.id - 1]}
            />
          </div>
        ))}
        <div className="play-cell play-cell-categories">
          <CategoryReveal
            categoryNames={categoryNames}
            lockedAnswers={gameState.lockedAnswers}
            discoveredCategories={gameState.discoveredOuterCategories}
            gameComplete={gameState.gameComplete}
          />
        </div>
      </div>
    </div>
  )
}
