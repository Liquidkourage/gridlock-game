export interface Block {
  id: string
  text: string
  gridIndex: number
  position: number
}

export interface Answer {
  text: string
  category: string
  blocks: Block[]
  categorySetIndex: number
}

export interface GameState {
  selectedBlocks: Block[]
  lockedAnswers: Answer[]
  gameComplete: boolean
  /** Puzzle category indices (0–3) in order first solved across all outer grids */
  discoveredOuterCategories: number[]
}
