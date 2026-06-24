import React, { useLayoutEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"

function applyLayoutVars() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const root = document.documentElement.style

  const headerHeight = Math.max(48, Math.round(vh * 0.06))
  const mainPad = Math.max(8, Math.round(vh * 0.01))
  const gridGap = Math.max(8, Math.round(Math.min(vw, vh) * 0.012))
  const cellGap = Math.max(4, Math.round(gridGap * 0.5))
  const cardPad = Math.max(6, Math.round(vh * 0.008))
  const h1Size = Math.max(20, Math.round(vh * 0.042))
  const h3Size = Math.max(12, Math.round(vh * 0.013))
  const selectionRowH = Math.max(28, Math.round(vh * 0.03))
  const selectionFont = Math.max(11, Math.round(selectionRowH * 0.42))
  const gameMaxW = Math.min(vw - 2 * mainPad, 900)

  const outerChromeH =
    cardPad * 2 + h3Size + cellGap * 2 + selectionRowH + selectionRowH * 1.1 + 4

  const toolbarH = 32
  const mainH = vh - headerHeight - 2 * mainPad
  const gameH = Math.max(0, mainH - toolbarH - gridGap)
  const outerSectionH = gameH * 0.64
  const outerRowH = (outerSectionH - gridGap) / 2

  // Size board from viewport height; cards shrink-wrap to board
  const outerBoardByHeight = Math.floor(outerRowH - outerChromeH)
  const outerBoardMax = Math.max(
    150,
    Math.min(
      outerBoardByHeight,
      Math.floor(vh * 0.19),
      Math.floor((gameMaxW - gridGap) / 2 - cardPad * 2 - 8)
    )
  )

  const middleChromeH =
    cardPad * 2 + h3Size + cellGap * 2 + selectionRowH + selectionRowH * 1.1 + 4
  const middleSectionH = gameH * 0.36
  const middleBoardByHeight = Math.floor(middleSectionH - middleChromeH)
  const middleBoardMax = Math.max(
    160,
    Math.min(
      middleBoardByHeight,
      Math.floor(vh * 0.21),
      Math.floor(outerBoardMax * 1.35),
      gameMaxW - cardPad * 2 - 8
    )
  )

  root.setProperty("--app-header-height", `${headerHeight}px`)
  root.setProperty("--app-header-pad", `${Math.round(headerHeight * 0.16)}px`)
  root.setProperty("--app-main-pad", `${mainPad}px`)
  root.setProperty("--grid-gap", `${gridGap}px`)
  root.setProperty("--cell-gap", `${cellGap}px`)
  root.setProperty("--card-pad", `${cardPad}px`)
  root.setProperty("--h1-size", `${h1Size}px`)
  root.setProperty("--h3-size", `${h3Size}px`)
  root.setProperty("--selection-row-h", `${selectionRowH}px`)
  root.setProperty("--selection-font", `${selectionFont}px`)
  root.setProperty("--game-max-w", `${gameMaxW}px`)
  root.setProperty("--outer-board-max", `${outerBoardMax}px`)
  root.setProperty("--middle-board-max", `${middleBoardMax}px`)
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
        <p>Daily puzzle prototype (React)</p>
      </header>
      <main className="app-main">
        <GridLockGame />
      </main>
    </div>
  )
}
