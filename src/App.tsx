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
  const h3Size = Math.max(11, Math.round(vh * 0.012))
  const selectionRowH = Math.max(28, Math.round(vh * 0.032))
  const selectionFont = Math.max(12, Math.round(selectionRowH * 0.44))
  const answerLineH = Math.max(11, Math.round(selectionRowH * 0.32))
  const answersHeaderH = Math.max(10, Math.round(selectionFont * 0.8))
  const answersRowGap = Math.max(2, Math.round(cellGap * 0.2))
  const answersBodyH = answerLineH * 4 + answersRowGap * 3 + 2
  const answersPaneH = answersHeaderH + answersBodyH + 2

  const sectionGap = Math.round(cellGap * 0.6)
  const answersTopGap = Math.round(cellGap * 0.35)
  const cardChromeH =
    h3Size +
    sectionGap +
    sectionGap +
    selectionRowH +
    sectionGap +
    answersTopGap +
    answersPaneH

  const categoryCardWidth = 108
  const gridGap = categoryCardWidth + 16
  const gameMaxW = Math.min(vw - mainPad * 2, 1040)
  const cardMaxFromW = Math.floor((gameMaxW - gridGap) / 2)
  const cardMaxFromVh = Math.floor(vh * 0.34)

  let outerCardSize = Math.max(268, Math.min(cardMaxFromW, cardMaxFromVh, 360))
  let outerBoardMax = Math.max(160, outerCardSize - 2 * cardPad - cardChromeH)
  outerCardSize = 2 * cardPad + outerBoardMax + cardChromeH

  if (outerCardSize > cardMaxFromW) {
    outerCardSize = cardMaxFromW
    outerBoardMax = Math.max(160, outerCardSize - 2 * cardPad - cardChromeH)
    outerCardSize = 2 * cardPad + outerBoardMax + cardChromeH
  }

  const categoryLineH = Math.max(11, Math.round(answerLineH * 0.58))
  const categoryFont = Math.max(9, Math.round(selectionFont * 0.68))
  const categoryPad = Math.max(4, Math.round(cardPad * 0.4))
  const categoryH3 = Math.max(8, Math.round(h3Size * 0.82))
  const categoryBodyH = categoryLineH * 4 + Math.max(2, Math.round(cellGap * 0.25)) * 3
  const categoryCardHeight = categoryPad * 2 + categoryH3 + categoryBodyH + 6

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
  root.setProperty("--answers-row-gap", `${answersRowGap}px`)
  root.setProperty("--card-chrome-h", `${cardChromeH}px`)
  root.setProperty("--game-max-w", `${gameMaxW}px`)
  root.setProperty("--outer-board-max", `${outerBoardMax}px`)
  root.setProperty("--outer-card-size", `${outerCardSize}px`)
  root.setProperty("--category-card-width", `${categoryCardWidth}px`)
  root.setProperty("--category-card-height", `${categoryCardHeight}px`)
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
