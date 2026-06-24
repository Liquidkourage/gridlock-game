import React, { useCallback } from "react"
import "./MiddleGrid.css"
import { useTileDragSwap } from "./useTileDragSwap"
import type { Answer } from "../types/game"
import { orderByTierRows, tierIndex } from "../utils/tierOrder"

interface Props {
  revealed: boolean[]
  order: number[]
  onShuffle: () => void
  onSwapTiles: (fromDataIdx: number, toDataIdx: number) => void
  labels: string[]
  blocks: { id: string; text: string; gridIndex: number; position: number }[]
  onToggleSelect: (block: { id: string; text: string; gridIndex: number; position: number }) => void
  onClearSelection: () => void
  selected: { id: string; text: string; gridIndex: number; position: number }[]
  lockedAnswers: Answer[]
  discoveredCategories: number[]
  gameComplete: boolean
}

export function MiddleGrid({
  revealed,
  order,
  onShuffle,
  onSwapTiles,
  labels,
  blocks,
  onToggleSelect,
  onClearSelection,
  selected,
  lockedAnswers,
  discoveredCategories,
  gameComplete,
}: Props) {
  const handleSwap = useCallback(
    (fromKey: string, toKey: string) => onSwapTiles(Number(fromKey), Number(toKey)),
    [onSwapTiles]
  )
  const { bindTile, tileClass, suppressClickRef } = useTileDragSwap(handleSwap)

  const totalCells = 16
  const displayOrderById = new Map<string, number>()
  for (let disp = 0; disp < totalCells; disp++) {
    const id = blocks[order[disp]]?.id
    if (id) displayOrderById.set(id, disp)
  }
  const orderedDataIdxs = orderByTierRows(
    Array.from({ length: totalCells }, (_, dataIdx) => ({
      id: blocks[dataIdx]?.id ?? `empty-${dataIdx}`,
      dataIdx,
    })),
    lockedAnswers,
    discoveredCategories,
    item => displayOrderById.get(item.id) ?? item.dataIdx
  ).map(item => item.dataIdx)

  const cells = orderedDataIdxs.map((dataIdx) => {
    const labelIdx = dataIdx < labels.length ? dataIdx : -1
    const isRevealed = revealed[dataIdx]
    const text = labelIdx >= 0 ? labels[labelIdx] : ""
    const block = blocks[dataIdx]
    const blockId = block?.id || ""
    const isSelected = block ? selected.some(b => b.id === blockId) : false
    const lockedAnswer = block ? lockedAnswers.find(a => a.blocks.some(x => x.id === blockId)) : undefined
    const isLocked = Boolean(lockedAnswer)
    const tier = lockedAnswer
      ? tierIndex(lockedAnswer.categorySetIndex, discoveredCategories)
      : -1
    return { i: dataIdx, text, revealed: isRevealed, block, isSelected, isLocked, tier }
  })

  return (
    <section className="middle-grid">
      <h3>Final Grid <button className="mini-btn" onClick={onShuffle} title="Shuffle final grid">Shuffle</button></h3>
      <div className="grid-board-wrap">
        <div className="middle-answers middle-answers-4x4">
          {cells.map((cell) => {
            const key = String(cell.i)
            const dragDisabled = cell.isLocked || !cell.revealed
            const drag = bindTile(key, dragDisabled)
            return (
              <div
                key={key}
                className={`middle-answer ${cell.revealed ? "revealed" : "hidden"} ${cell.isSelected ? "selected" : ""}${cell.isLocked && cell.tier >= 0 && cell.tier < 4 ? ` locked cat-${cell.tier}` : cell.isLocked ? " locked" : ""}${tileClass(key, dragDisabled)}`}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    return
                  }
                  if (cell.revealed && !cell.isLocked && cell.block) onToggleSelect(cell.block)
                }}
                {...drag}
              >
                <div className="answer-text">
                  {cell.revealed ? cell.text : "???"}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="selection-row">
        <div className="selection-output lcd">
          <div className="selection-body">{selected.length > 0 ? selected.map(s => s.text).join("") : "—"}</div>
        </div>
        <div className="answer-input">
          <button onClick={onClearSelection} disabled={selected.length === 0}>Clear</button>
          <button onClick={onShuffle}>Shuffle</button>
        </div>
      </div>

      <div className="selection-output answers">
        <div className="selection-header">Answers</div>
        <div className="selection-body">
          {lockedAnswers.length > 0 ? (
            [0, 1, 2, 3].map(tier => {
              const answer = lockedAnswers.find(
                a => tierIndex(a.categorySetIndex, discoveredCategories) === tier
              )
              return answer ? (
                <div key={tier} className={`locked-line cat-${tier}`}>
                  {answer.text.split(" ").join("")}
                </div>
              ) : (
                <div key={tier} className="locked-line locked-line-empty" aria-hidden="true" />
              )
            })
          ) : (
            "—"
          )}
        </div>
      </div>

      {gameComplete && (
        <div className="game-complete-message">Puzzle complete!</div>
      )}
    </section>
  )
}
