import type { Answer } from "../types/game"
import type { Puzzle } from "../data/puzzles"

export function getCategoryName(puzzle: Puzzle, setIndex: number): string {
  const outer = puzzle.outer[setIndex]
  if (outer?.name?.trim()) return outer.name.trim()
  const label = puzzle.final?.labels?.[setIndex]
  if (label?.trim()) return label.trim()
  return `Category ${setIndex + 1}`
}

export function isCategorySetComplete(lockedAnswers: Answer[], setIndex: number): boolean {
  const grids = new Set<number>()
  for (const answer of lockedAnswers) {
    if (answer.categorySetIndex !== setIndex) continue
    const match = /^Grid (\d+)$/.exec(answer.category)
    if (match) grids.add(Number(match[1]))
  }
  return grids.size >= 4
}

export function allCategorySetsComplete(lockedAnswers: Answer[]): boolean {
  return [0, 1, 2, 3].every(i => isCategorySetComplete(lockedAnswers, i))
}
