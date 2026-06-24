import React, { useLayoutEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"
import { CreatorPage } from "./pages/CreatorPage"
import { usePathname } from "./router"

function slotRowH(font: number) {
  return font + 8
}

function labelH(font: number) {
  return Math.round(font * 1.15) + 3
}

function cardChromeHeight(
  tileFont: number,
  selectionRowH: number,
  answersRowGap: number,
  cellGap: number
) {
  const answerLineH = slotRowH(tileFont)
  const answersPaneH = labelH(tileFont) + answerLineH * 4 + answersRowGap * 3 + 3
  const sectionGap = Math.round(cellGap * 0.55)
  const answersTopGap = Math.round(cellGap * 0.3)
  return (
    labelH(tileFont) +
    sectionGap +
    sectionGap +
    selectionRowH +
    sectionGap +
    answersTopGap +
    answersPaneH
  )
}

function categoryCardHeight(
  tileFont: number,
  categoryPad: number,
  answersRowGap: number
) {
  const lineH = slotRowH(tileFont)
  return categoryPad * 2 + labelH(tileFont) + lineH * 4 + answersRowGap * 3 + 4
}

function applyLayoutVars() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const root = document.documentElement.style

  const headerHeight = Math.max(40, Math.min(56, Math.round(vh * 0.055)))
  const mainPad = Math.max(6, Math.round(Math.min(vw, vh) * 0.007))
  const cellGap = Math.max(4, Math.round(Math.min(vw, vh) * 0.0055))
  const cardPad = Math.max(8, Math.round(vh * 0.007))
  const h1Size = Math.max(22, Math.min(30, Math.round(vh * 0.028)))
  const selectionRowH = Math.max(26, Math.min(32, Math.round(vh * 0.028)))
  const answersRowGap = Math.max(3, Math.round(cellGap * 0.3))
  const categoryPad = Math.max(5, Math.round(cardPad * 0.45))
  const categoryCardWidth = 112

  const playAreaH = vh - headerHeight - mainPad * 2
  const gameMaxW = Math.min(vw - mainPad * 2, 1040)

  let gridGap = categoryCardWidth + 14
  let outerCardSize = Math.max(
    200,
    Math.min(
      Math.floor((playAreaH - gridGap) / 2),
      Math.floor((gameMaxW - gridGap) / 2),
      340
    )
  )

  for (let pass = 0; pass < 3; pass++) {
    const tileFontEst = Math.max(10, Math.min(Math.round((outerCardSize - 2 * cardPad - 100) * 0.052), 16))
    const chromeH = cardChromeHeight(tileFontEst, selectionRowH, answersRowGap, cellGap)
    let outerBoardMax = Math.max(140, outerCardSize - 2 * cardPad - chromeH)
    const tileFont = Math.max(10, Math.min(Math.round(outerBoardMax * 0.052), 16))
    const chromeFinal = cardChromeHeight(tileFont, selectionRowH, answersRowGap, cellGap)
    outerBoardMax = Math.max(140, outerCardSize - 2 * cardPad - chromeFinal)
    const catH = categoryCardHeight(tileFont, categoryPad, answersRowGap)
    gridGap = Math.max(categoryCardWidth + 14, catH + 8)
    outerCardSize = Math.max(
      200,
      Math.min(
        Math.floor((playAreaH - gridGap) / 2),
        Math.floor((gameMaxW - gridGap) / 2),
        340
      )
    )
  }

  const tileFontEst = Math.max(10, Math.min(Math.round((outerCardSize - 2 * cardPad - 100) * 0.052), 16))
  const chromeFinal = cardChromeHeight(tileFontEst, selectionRowH, answersRowGap, cellGap)
  let outerBoardMax = Math.max(140, outerCardSize - 2 * cardPad - chromeFinal)
  const tileFont = Math.max(10, Math.min(Math.round(outerBoardMax * 0.052), 16))
  const finalChrome = cardChromeHeight(tileFont, selectionRowH, answersRowGap, cellGap)
  outerBoardMax = Math.max(140, outerCardSize - 2 * cardPad - finalChrome)
  outerCardSize = 2 * cardPad + outerBoardMax + finalChrome

  const answerLineH = slotRowH(tileFont)
  const answersPaneH = labelH(tileFont) + answerLineH * 4 + answersRowGap * 3 + 3
  const categoryLineH = answerLineH
  const categoryBodyH = categoryLineH * 4 + answersRowGap * 3 + 4
  const categoryCardHeightFinal = categoryPad * 2 + labelH(tileFont) + categoryBodyH + 4
  gridGap = Math.max(categoryCardWidth + 14, categoryCardHeightFinal + 8)

  root.setProperty("--app-header-height", `${headerHeight}px`)
  root.setProperty("--app-header-pad", `${Math.max(6, Math.round(headerHeight * 0.14))}px`)
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
  root.setProperty("--card-chrome-h", `${finalChrome}px`)
  root.setProperty("--game-max-w", `${gameMaxW}px`)
  root.setProperty("--outer-board-max", `${outerBoardMax}px`)
  root.setProperty("--outer-card-size", `${outerCardSize}px`)
  root.setProperty("--category-card-width", `${categoryCardWidth}px`)
  root.setProperty("--category-card-height", `${categoryCardHeightFinal}px`)
  root.setProperty("--category-line-h", `${categoryLineH}px`)
  root.setProperty("--category-row-gap", `${answersRowGap}px`)
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
