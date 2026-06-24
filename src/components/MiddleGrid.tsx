import React, { useCallback } from "react"
import "./MiddleGrid.css"
import { useTileDragSwap } from "./useTileDragSwap"

interface Props {
  revealed: boolean[]
  order: number[]
  onShuffle: () => void
  onSwapTiles: (fromDataIdx: number, toDataIdx: number) => void
  labels: string[]
  highlights: number[][]
  blocks: { id: string; text: string; gridIndex: number; position: number }[]
  onToggleSelect: (block: { id: string; text: string; gridIndex: number; position: number }) => void
  onClearSelection: () => void
  selected: { id: string; text: string; gridIndex: number; position: number }[]
  lockedAnswers: { text: string; category: string; blocks: { id: string }[] }[]
  gameComplete: boolean
  finalWord: string
}

export function MiddleGrid({
  revealed,
  order,
  onShuffle,
  onSwapTiles,
  labels,
  highlights,
  blocks,
  onToggleSelect,
  onClearSelection,
  selected,
  lockedAnswers,
  gameComplete,
  finalWord,
}: Props) {
  const handleSwap = useCallback(
    (fromKey: string, toKey: string) => onSwapTiles(Number(fromKey), Number(toKey)),
    [onSwapTiles]
  )
  const { bindTile, tileClass, suppressClickRef } = useTileDragSwap(handleSwap)

  const totalCells = 16
  const orderedDataIdxs = (() => {
    const blockToGroupIndex = new Map<string, number>()
    const blockToWithinGroup = new Map<string, number>()
    const indexById = new Map<string, number>()
    for (let disp = 0; disp < totalCells; disp++) {
      const dataIdx = order[disp]
      const id = blocks[dataIdx]?.id
      if (id) indexById.set(id, disp)
    }
    lockedAnswers.forEach((ans, groupIdx) => {
      ans.blocks.forEach((b, i) => {
        blockToGroupIndex.set(b.id, groupIdx)
        blockToWithinGroup.set(b.id, i)
      })
    })
    const allIdxs = Array.from({ length: totalCells }, (_, i) => i)
    allIdxs.sort((a, b) => {
      const ida = blocks[a]?.id || ""
      const idb = blocks[b]?.id || ""
      const ga = blockToGroupIndex.has(ida) ? blockToGroupIndex.get(ida)! : Number.POSITIVE_INFINITY
      const gb = blockToGroupIndex.has(idb) ? blockToGroupIndex.get(idb)! : Number.POSITIVE_INFINITY
      if (ga !== gb) return ga - gb
      if (ga !== Number.POSITIVE_INFINITY) {
        const ia = blockToWithinGroup.get(ida) ?? 0
        const ib = blockToWithinGroup.get(idb) ?? 0
        return ia - ib
      }
      const ra = indexById.get(ida) ?? 0
      const rb = indexById.get(idb) ?? 0
      return ra - rb
    })
    return allIdxs
  })()

  const cells = orderedDataIdxs.map((dataIdx) => {
    const labelIdx = dataIdx < labels.length ? dataIdx : -1
    const isRevealed = revealed[dataIdx]
    const text = labelIdx >= 0 ? labels[labelIdx] : ""
    const hl = labelIdx >= 0 ? (highlights[labelIdx] || []) : []
    const block = blocks[dataIdx]
    const blockId = block?.id || ""
    const isSelected = block ? selected.some(b => b.id === blockId) : false
    const isLocked = block ? lockedAnswers.some(a => a.blocks.some(x => x.id === blockId)) : false
    return { i: dataIdx, text, hl, revealed: isRevealed, block, isSelected, isLocked }
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
                className={`middle-answer ${cell.revealed ? "revealed" : "hidden"} ${cell.isSelected ? "selected" : ""} ${cell.isLocked ? "locked" : ""}${tileClass(key, dragDisabled)}`}
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
                  {cell.revealed ? (
                    cell.text.split("").map((ch, idx) => (
                      <span key={idx} className={cell.hl.includes(idx) ? "hl" : undefined}>{ch}</span>
                    ))
                  ) : (
                    "???"
                  )}
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
          {lockedAnswers.length > 0 ? lockedAnswers.map((a, idx) => (
            <div key={idx} className="locked-line">{a.text.split(" ").join("")}</div>
          )) : "—"}
        </div>
      </div>

      {gameComplete && (
        <div className="game-complete-message">All final answers revealed! Target: {finalWord}</div>
      )}
    </section>
  )
}
