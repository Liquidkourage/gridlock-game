export interface Block {  id: string;  text: string;  gridIndex: number;  position: number;}export interface Answer {  text: string;  category: string;  blocks: Block[];}export interface OuterGrid {  id: number;  blocks: Block[];  answers: Answer[];}export interface MiddleGrid {  answers: Answer[];  missingLetters: string[];  finalWord: string;}export interface PuzzleData {  date: string;  outerGrids: OuterGrid[];  middleGrid: MiddleGrid;  finalWord: string;}export interface GameState {
  selectedBlocks: Block[]
  lockedAnswers: Answer[]
  revealedMiddleBlocks: boolean[]
  gameComplete: boolean
}