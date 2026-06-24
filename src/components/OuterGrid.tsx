import React, { useCallback } from "react"
import "./OuterGrid.css"
import type { Answer, Block } from "../types/game"
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

function tierIndex(categorySetIndex: number, discovered: number[]): number {
  const t = discovered.indexOf(categorySetIndex)
  return t >= 0 ? t : Number.POSITIVE_INFINITY
}

function tierForBlock(lockedAnswers: Answer[], blockId: string, discovered: number[]): number {
  const answer = lockedAnswers.find(a => a.blocks.some(x => x.id === blockId))
  if (!answer) return -1
  return tierIndex(answer.categorySetIndex, discovered)
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

  // Locked groups snap to tier row (bronze=row 1, silver=row 2, …)
  const orderedBlocks = React.useMemo(() => {
    const blockToTier = new Map<string, number>()
    const blockToWithinGroup = new Map<string, number>()
    const indexById = new Map<string, number>()
    blocks.forEach((b, idx) => indexById.set(b.id, idx))

    lockedAnswers.forEach(ans => {
      const tier = tierIndex(ans.categorySetIndex, discoveredCategories)
      ans.blocks.forEach((b, i) => {
        blockToTier.set(b.id, tier)
        blockToWithinGroup.set(b.id, i)
      })
    })
    return [...blocks].sort((a, b) => {
      const ga = blockToTier.has(a.id) ? blockToTier.get(a.id)! : Number.POSITIVE_INFINITY
      const gb = blockToTier.has(b.id) ? blockToTier.get(b.id)! : Number.POSITIVE_INFINITY
      if (ga !== gb) return ga - gb
      if (ga !== Number.POSITIVE_INFINITY) {
        const ia = blockToWithinGroup.get(a.id) ?? 0
        const ib = blockToWithinGroup.get(b.id) ?? 0
        return ia - ib
      }
      return (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0)
    })
  }, [blocks, lockedAnswers, discoveredCategories])

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
                {block.text}
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
    </section>
  )
}
