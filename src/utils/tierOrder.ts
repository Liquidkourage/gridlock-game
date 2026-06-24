import type { Answer } from "../types/game"

const GRID_CELLS = 16
const COLS = 4

export function tierIndex(categorySetIndex: number, discovered: number[]): number {
  const t = discovered.indexOf(categorySetIndex)
  return t >= 0 ? t : Number.POSITIVE_INFINITY
}

export function tierForBlock(lockedAnswers: Answer[], blockId: string, discovered: number[]): number {
  const answer = lockedAnswers.find(a => a.blocks.some(x => x.id === blockId))
  if (!answer) return -1
  const t = tierIndex(answer.categorySetIndex, discovered)
  return t >= 0 && t < 4 ? t : -1
}

/** Locked groups snap to tier row (bronze=row 1, silver=row 2, …); unlocked fill remaining cells. */
export function orderByTierRows<T extends { id: string }>(
  items: T[],
  lockedAnswers: Answer[],
  discoveredCategories: number[],
  originalOrder: (item: T) => number
): T[] {
  const blockToTier = new Map<string, number>()
  const blockToWithinGroup = new Map<string, number>()

  lockedAnswers.forEach(ans => {
    const tier = tierIndex(ans.categorySetIndex, discoveredCategories)
    if (tier >= 4) return
    ans.blocks.forEach((b, i) => {
      blockToTier.set(b.id, tier)
      blockToWithinGroup.set(b.id, i)
    })
  })

  const slots: (T | undefined)[] = Array(GRID_CELLS)
  const unlocked: T[] = []

  for (const item of items) {
    const tier = blockToTier.get(item.id)
    if (tier !== undefined && tier < 4) {
      const within = blockToWithinGroup.get(item.id) ?? 0
      slots[tier * COLS + within] = item
    } else {
      unlocked.push(item)
    }
  }

  unlocked.sort((a, b) => originalOrder(a) - originalOrder(b))

  const result: T[] = []
  let u = 0
  for (let i = 0; i < GRID_CELLS; i++) {
    if (slots[i] !== undefined) {
      result.push(slots[i]!)
    } else if (u < unlocked.length) {
      result.push(unlocked[u++])
    }
  }

  return result.length === items.length ? result : items
}
