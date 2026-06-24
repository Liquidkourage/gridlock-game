import React from "react"
import "./CategoryReveal.css"
import type { Answer } from "../types/game"
import { isCategorySetComplete } from "../utils/categorySets"

interface Props {
  categoryNames: string[]
  lockedAnswers: Answer[]
  discoveredCategories: number[]
  gameComplete: boolean
}

export function CategoryReveal({
  categoryNames,
  lockedAnswers,
  discoveredCategories,
  gameComplete,
}: Props) {
  return (
    <section className="category-reveal">
      <h3>Categories</h3>
      <div className="category-rows">
        {[0, 1, 2, 3].map(tier => {
          const setIndex = discoveredCategories[tier]
          const complete =
            setIndex !== undefined && isCategorySetComplete(lockedAnswers, setIndex)
          const name = complete ? categoryNames[setIndex] : null
          return (
            <div
              key={tier}
              className={`category-slot cat-${tier}${complete ? " revealed" : ""}`}
            >
              {name ?? "—"}
            </div>
          )
        })}
      </div>
      {gameComplete && (
        <p className="category-complete">Puzzle complete!</p>
      )}
    </section>
  )
}
