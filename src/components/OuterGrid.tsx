import React, { useCallback } from "react"
import "./OuterGrid.css"
import type { Answer, Block } from "../types/game"
import { orderByTierRows, tierForBlock, tierIndex } from "../utils/tierOrder"
import { useTileDragSwap } from "./useTileDragSwap"

interface Props {
  gridId: number
  title: string
  blocks: Block[]
  selected: Block[]
  lockedAnswers: Answer[]
  /** Global order in which category sets were first solved (outer grids) */
  discoveredCategories: number[]
  onToggleSelect: (block: Block) => void
  onClearSelection: () => void
  onShuffle: () => void
  onSwapTiles: (fromBlockId: string, toBlockId: string) => void
  disableInteraction?: boolean
  wrongFeedback?: boolean
  successFeedback?: boolean
}

export function OuterGrid({
  gridId,
  title,
  blocks,
  selected,
  lockedAnswers,
  discoveredCategories,
  onToggleSelect,
  onClearSelection,
  onShuffle,
  onSwapTiles,
  disableInteraction,
  wrongFeedback,
  successFeedback,
}: Props) {
  const isSelected = (b: Block) => selected.some(s => s.id === b.id)
  const isLocked = (b: Block) => lockedAnswers.some(a => a.blocks.some(x => x.id === b.id))
  const selectedForThisGrid = selected.filter(b => b.gridIndex === gridId)

  const handleSwap = useCallback(
    (fromId: string, toId: string) => onSwapTiles(fromId, toId),
    [onSwapTiles]
  )
  const { bindTile, tileClass, suppressClickRef } = useTileDragSwap(handleSwap)

  const orderedBlocks = React.useMemo(
    () => orderByTierRows(blocks, lockedAnswers, discoveredCategories, b => blocks.indexOf(b)),
    [blocks, lockedAnswers, discoveredCategories]
  )

  return (
    <section className={`outer-grid${wrongFeedback ? " wrong" : ""}${successFeedback ? " success" : ""}`}>
      <h3>{title}</h3>
      <div className="grid-board-wrap">
        <div className="grid-blocks">
          {orderedBlocks.map(block => {
            const locked = isLocked(block)
            const tier = tierForBlock(lockedAnswers, block.id, discoveredCategories)
            const dragDisabled = locked || Boolean(disableInteraction)
            const drag = bindTile(block.id, dragDisabled)
            return (
              <button
                key={block.id}
                className={`grid-block${isSelected(block) ? " selected" : ""}${locked && tier >= 0 ? ` locked cat-${tier}` : locked ? " locked" : ""}${tileClass(block.id, dragDisabled)}`}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    return
                  }
                  onToggleSelect(block)
                }}
                disabled={locked || disableInteraction}
                {...drag}
              >
                <span className={`grid-block-text len-${Math.min(4, Math.max(1, block.text.length))}`}>
                  {block.text}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={`selection-row`}>
        <div className={`selection-output lcd${wrongFeedback ? " wrong" : ""}`}>
          <div className="selection-body">
            {selectedForThisGrid.length > 0 ? selectedForThisGrid.map(b => b.text).join("") : "—"}
          </div>
        </div>
        <div className="answer-input">
          <button onClick={onClearSelection} disabled={disableInteraction || selectedForThisGrid.length === 0}>Clear</button>
          <button onClick={onShuffle} disabled={disableInteraction}>Shuffle</button>
        </div>
      </div>

      <div className="selection-output answers">
        <div className="selection-header">Answers</div>
        <div className="selection-body">
          {[0, 1, 2, 3].map(tier => {
            const answer = lockedAnswers.find(
              a => tierIndex(a.categorySetIndex, discoveredCategories) === tier
            )
            if (!answer) {
              return <div key={tier} className="locked-line locked-line-empty" aria-hidden="true" />
            }
            const displayText = answer.text.split(" ").join("")
            const len = displayText.length
            const lenClass =
              len <= 7 ? "ans-short" : len <= 9 ? "ans-mid" : len <= 11 ? "ans-long" : "ans-xl"
            return (
              <div key={tier} className={`locked-line cat-${tier} ${lenClass}`}>
                {displayText}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
