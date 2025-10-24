import React from "react"
import "./OuterGrid.css"
import type { Answer, Block } from "../types/game"

interface Props {
  gridId: number
  title: string
  blocks: Block[]
  selected: Block[]
  lockedAnswers: Answer[]
  onToggleSelect: (block: Block) => void
  onClearSelection: () => void
  onShuffle: () => void
  disableInteraction?: boolean
  wrongFeedback?: boolean
  successFeedback?: boolean
}

export function OuterGrid({ gridId, title, blocks, selected, lockedAnswers, onToggleSelect, onClearSelection, onShuffle, disableInteraction, wrongFeedback, successFeedback }: Props) {
  const isSelected = (b: Block) => selected.some(s => s.id === b.id)
  const isLocked = (b: Block) => lockedAnswers.some(a => a.blocks.some(x => x.id === b.id))
  const selectedForThisGrid = selected.filter(b => b.gridIndex === gridId)

  // Order blocks so locked answers occupy the top rows (first 4, then next 4, ...)
  // For unlocked blocks, preserve the incoming array order (supports shuffling)
  const orderedBlocks = React.useMemo(() => {
    const blockToGroupIndex = new Map<string, number>()
    const blockToWithinGroup = new Map<string, number>()
    const indexById = new Map<string, number>()
    blocks.forEach((b, idx) => indexById.set(b.id, idx))

    lockedAnswers.forEach((ans, groupIdx) => {
      ans.blocks.forEach((b, i) => {
        blockToGroupIndex.set(b.id, groupIdx)
        blockToWithinGroup.set(b.id, i)
      })
    })
    return [...blocks].sort((a, b) => {
      const ga = blockToGroupIndex.has(a.id) ? blockToGroupIndex.get(a.id)! : Number.POSITIVE_INFINITY
      const gb = blockToGroupIndex.has(b.id) ? blockToGroupIndex.get(b.id)! : Number.POSITIVE_INFINITY
      if (ga !== gb) return ga - gb
      if (ga !== Number.POSITIVE_INFINITY) {
        // Within same locked group, keep their within-group order
        const ia = blockToWithinGroup.get(a.id) ?? 0
        const ib = blockToWithinGroup.get(b.id) ?? 0
        return ia - ib
      }
      // Unlocked: preserve current array order (supports shuffle)
      return (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0)
    })
  }, [blocks, lockedAnswers])

  return (
    <section className={`outer-grid${wrongFeedback ? " wrong" : ""}${successFeedback ? " success" : ""}`}>
      <h3>{title}</h3>
      <div className="grid-blocks">
        {orderedBlocks.map(block => (
          <button
            key={block.id}
            className={`grid-block${isSelected(block) ? " selected" : ""}${isLocked(block) ? " locked" : ""}`}
            onClick={() => onToggleSelect(block)}
            disabled={isLocked(block) || disableInteraction}
          >
            {block.text}
          </button>
        ))}
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
          {lockedAnswers.length > 0 ? lockedAnswers.map((a, idx) => (
            <div key={idx} className="locked-line">{a.text.split(" ").join("")}</div>
          )) : "—"}
        </div>
      </div>
    </section>
  )
}


