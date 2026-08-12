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

/** Map common category labels to subtle line-icon keys (fallback: generic). */
function categoryIconKey(name: string): string {
  const n = name.toLowerCase()
  if (/nature|plant|animal|earth|geo|flora|fauna|ocean|wildlife/.test(n)) return "nature"
  if (/history|histor|war|ancient|era|century|empire/.test(n)) return "history"
  if (/music|song|band|audio|instrument|melody/.test(n)) return "music"
  if (/movie|film|cinema|tv|screen|actor/.test(n)) return "movies"
  if (/science|chem|phys|bio|tech|space|astro/.test(n)) return "science"
  if (/sport|game|athle|ball|olymp/.test(n)) return "sports"
  return "generic"
}

function CategoryIcon({ kind }: { kind: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className: "category-icon",
  }
  switch (kind) {
    case "nature":
      return (
        <svg {...common}>
          <path d="M12 22V10" />
          <path d="M12 10C8 10 5 7.5 5 4c4 0 7 2.5 7 6z" />
          <path d="M12 10c4 0 7-2.5 7-6-4 0-7 2.5-7 6z" />
        </svg>
      )
    case "history":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      )
    case "music":
      return (
        <svg {...common}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="7" cy="18" r="2.5" />
          <circle cx="17" cy="16" r="2.5" />
        </svg>
      )
    case "movies":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M8 6l2 12M14 6l2 12M3 10h18M3 14h18" />
        </svg>
      )
    case "science":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v5.5L6 18a3 3 0 003 3h6a3 3 0 003-3l-4-9.5V3" />
          <path d="M8.5 14h7" />
        </svg>
      )
    case "sports":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />
          <path d="M3.5 9.5h17M3.5 14.5h17" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        </svg>
      )
  }
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
          const iconKey = name ? categoryIconKey(name) : null
          return (
            <div
              key={tier}
              className={`category-slot cat-${tier}${complete ? " revealed" : ""}`}
            >
              {name && iconKey ? (
                <>
                  <CategoryIcon kind={iconKey} />
                  <span className="category-slot-label">{name}</span>
                </>
              ) : (
                <span className="category-slot-empty" aria-hidden="true">
                  ———
                </span>
              )}
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
