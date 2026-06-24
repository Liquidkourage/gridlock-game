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
  const cellGap = Math.max(5, Math.round(Math.min(vw, vh) * 0.0063))
  const cardPad = Math.max(10, Math.round(vh * 0.01))
  const h1Size = Math.max(26, Math.round(vh * 0.036))
  const selectionRowH = Math.max(28, Math.round(vh * 0.032))
  const answersRowGap = Math.max(4, Math.round(cellGap * 0.35))
  const categoryPad = Math.max(6, Math.round(cardPad * 0.45))
  const sectionGap = Math.round(cellGap * 0.6)
  const answersTopGap = Math.round(cellGap * 0.35)

  const slotRowH = (font: number) => font + 10

  // Estimate chrome with typical tile font before board size is known
  const tileFontEst = 13
  const labelHEst = Math.round(tileFontEst * 1.2) + 4
  const answerLineHEst = slotRowH(tileFontEst)
  const answersPaneHEst = labelHEst + answerLineHEst * 4 + answersRowGap * 3 + 4
  const cardChromeH =
    labelHEst +
    sectionGap +
    sectionGap +
    selectionRowH +
    sectionGap +
    answersTopGap +
    answersPaneHEst

  const categoryCardWidth = 120
  const gridGapEst = 140
  const gameMaxW = Math.min(vw - mainPad * 2, 1040)
  const cardMaxFromW = Math.floor((gameMaxW - gridGapEst) / 2)
  const cardMaxFromVh = Math.floor(vh * 0.34)

  let outerCardSize = Math.max(268, Math.min(cardMaxFromW, cardMaxFromVh, 360))
  let outerBoardMax = Math.max(160, outerCardSize - 2 * cardPad - cardChromeH)
  outerCardSize = 2 * cardPad + outerBoardMax + cardChromeH

  if (outerCardSize > cardMaxFromW) {
    outerCardSize = cardMaxFromW
    outerBoardMax = Math.max(160, outerCardSize - 2 * cardPad - cardChromeH)
    outerCardSize = 2 * cardPad + outerBoardMax + cardChromeH
  }

  // Same formula as grid cells: clamp(10px, 5.2cqi, 16px) on the board
  const tileFont = Math.max(10, Math.min(Math.round(outerBoardMax * 0.052), 16))
  const labelH = Math.round(tileFont * 1.2) + 4
  const answerLineH = slotRowH(tileFont)
  const answersBodyH = answerLineH * 4 + answersRowGap * 3 + 4
  const answersPaneH = labelH + answersBodyH
  const categoryLineH = answerLineH
  const categoryRowGap = answersRowGap
  const categoryBodyH = categoryLineH * 4 + categoryRowGap * 3 + 4
  const categoryCardHeight = categoryPad * 2 + labelH + categoryBodyH + 4
  const gridGap = Math.max(categoryCardWidth + 16, categoryCardHeight + 12)

  root.setProperty("--app-header-height", `${headerHeight}px`)
  root.setProperty("--app-header-pad", `${Math.round(headerHeight * 0.18)}px`)
  root.setProperty("--app-main-pad", `${mainPad}px`)
  root.setProperty("--grid-gap", `${gridGap}px`)
  root.setProperty("--cell-gap", `${cellGap}px`)
  root.setProperty("--card-pad", `${cardPad}px`)
  root.setProperty("--h1-size", `${h1Size}px`)
  root.setProperty("--tile-font", `${tileFont}px`)
  root.setProperty("--selection-row-h", `${selectionRowH}px`)
  root.setProperty("--answers-pane-h", `${answersPaneH}px`)
  root.setProperty("--answer-line-h", `${answerLineH}px`)
  root.setProperty("--answers-row-gap", `${answersRowGap}px`)
  root.setProperty("--card-chrome-h", `${cardChromeH}px`)
  root.setProperty("--game-max-w", `${gameMaxW}px`)
  root.setProperty("--outer-board-max", `${outerBoardMax}px`)
  root.setProperty("--outer-card-size", `${outerCardSize}px`)
  root.setProperty("--category-card-width", `${categoryCardWidth}px`)
  root.setProperty("--category-card-height", `${categoryCardHeight}px`)
  root.setProperty("--category-line-h", `${categoryLineH}px`)
  root.setProperty("--category-row-gap", `${categoryRowGap}px`)
  root.setProperty("--category-pad", `${categoryPad}px`)
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
