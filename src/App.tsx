import React, { useLayoutEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"
import { CreatorPage } from "./pages/CreatorPage"
import { usePathname } from "./router"

function applyLayoutVars() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const root = document.documentElement.style

  const headerHeight = Math.max(52, Math.round(vh * 0.072))
  const mainPad = Math.max(10, Math.round(Math.min(vw, vh) * 0.012))
  const gridGap = Math.max(10, Math.round(Math.min(vw, vh) * 0.014))
  const cellGap = Math.max(5, Math.round(gridGap * 0.45))
  const cardPad = Math.max(10, Math.round(vh * 0.01))
  const h1Size = Math.max(26, Math.round(vh * 0.036))
  const h3Size = Math.max(11, Math.round(vh * 0.012))
  const selectionRowH = Math.max(28, Math.round(vh * 0.032))
  const selectionFont = Math.max(12, Math.round(selectionRowH * 0.44))
  const answersHeaderH = Math.max(13, Math.round(selectionFont * 1.05))
  const answerLineH = Math.max(18, Math.round(selectionRowH * 0.52))
  const answersPaneH = answersHeaderH + answerLineH * 4 + cellGap * 3 + 4
  const gameMaxW = Math.min(vw - mainPad * 2, 1040)

  // Board-first: readable tiles trump fitting everything above the fold
  const boardByWidth = Math.floor((gameMaxW - gridGap) / 2 - cardPad * 2)
  const boardByVh = Math.floor(vh * 0.215)
  const outerBoardMax = Math.max(
    172,
    Math.min(boardByWidth, boardByVh, 285)
  )

  const cardChromeNoBoard =
    h3Size +
    cellGap * 1.2 +
    selectionRowH +
    cellGap * 0.75 +
    answersPaneH

  const outerCardContentH = cardPad * 2 + outerBoardMax + cardChromeNoBoard
  const outerCardContentW = outerBoardMax + cardPad * 2
  const outerCardSize = Math.max(outerCardContentW, outerCardContentH)

  const categoryCardWidth = Math.max(100, Math.min(Math.round(outerCardSize * 0.3), 140))
  const categoryLineH = Math.max(12, Math.round(answerLineH * 0.58))
  const categoryFont = Math.max(9, Math.round(selectionFont * 0.68))
  const categoryPad = Math.max(4, Math.round(cardPad * 0.4))
  const categoryH3 = Math.max(8, Math.round(h3Size * 0.82))

  root.setProperty("--app-header-height", `${headerHeight}px`)
  root.setProperty("--app-header-pad", `${Math.round(headerHeight * 0.18)}px`)
  root.setProperty("--app-main-pad", `${mainPad}px`)
  root.setProperty("--grid-gap", `${gridGap}px`)
  root.setProperty("--cell-gap", `${cellGap}px`)
  root.setProperty("--card-pad", `${cardPad}px`)
  root.setProperty("--h1-size", `${h1Size}px`)
  root.setProperty("--h3-size", `${h3Size}px`)
  root.setProperty("--selection-row-h", `${selectionRowH}px`)
  root.setProperty("--selection-font", `${selectionFont}px`)
  root.setProperty("--answers-pane-h", `${answersPaneH}px`)
  root.setProperty("--answer-line-h", `${answerLineH}px`)
  root.setProperty("--game-max-w", `${gameMaxW}px`)
  root.setProperty("--outer-board-max", `${outerBoardMax}px`)
  root.setProperty("--outer-card-size", `${outerCardSize}px`)
  root.setProperty("--category-card-width", `${categoryCardWidth}px`)
  root.setProperty("--category-line-h", `${categoryLineH}px`)
  root.setProperty("--category-font", `${categoryFont}px`)
  root.setProperty("--category-pad", `${categoryPad}px`)
  root.setProperty("--category-h3", `${categoryH3}px`)
}

export default function App() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    applyLayoutVars()
    window.addEventListener("resize", applyLayoutVars)
    return () => window.removeEventListener("resize", applyLayoutVars)
  }, [])

  if (pathname === "/creator") {
    return <CreatorPage />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>GridLock</h1>
        <p>Find the links. Lock the grid.</p>
      </header>
      <main className="app-main">
        <GridLockGame />
      </main>
    </div>
  )
}
