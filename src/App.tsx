import React, { useLayoutEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"

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
  const answersPaneH = answersHeaderH + answerLineH * 2 + cellGap + 4
  const gameMaxW = Math.min(vw - mainPad * 2, 1040)

  // Board-first: readable tiles trump fitting everything above the fold
  const boardByWidth = Math.floor((gameMaxW - gridGap) / 2 - cardPad * 2)
  const boardByVh = Math.floor(vh * 0.19)
  const outerBoardMax = Math.max(
    168,
    Math.min(boardByWidth, boardByVh, 260)
  )

  const middleBoardMax = Math.max(
    184,
    Math.min(
      Math.floor(outerBoardMax * 1.12),
      Math.floor(gameMaxW - cardPad * 2),
      Math.floor(vh * 0.22),
      300
    )
  )

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
  root.setProperty("--middle-board-max", `${middleBoardMax}px`)
  root.setProperty("--outer-card-w", `${outerBoardMax + cardPad * 2}px`)
  root.setProperty("--middle-card-w", `${middleBoardMax + cardPad * 2}px`)
}

export default function App() {
  useLayoutEffect(() => {
    applyLayoutVars()
    window.addEventListener("resize", applyLayoutVars)
    return () => window.removeEventListener("resize", applyLayoutVars)
  }, [])

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
