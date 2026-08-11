import React, { useLayoutEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"
import { CreatorPage } from "./pages/CreatorPage"
import { navigate, usePathname } from "./router"
import { useTheme } from "./theme"

/** Largest integer square card that fits a 2×2 + center gap in the play area. */
function solveSquareLayout(vw: number, vh: number) {
  const headerHeight = Math.max(36, Math.min(52, Math.round(vh * 0.05)))
  const mainPad = Math.max(4, Math.round(Math.min(vw, vh) * 0.006))
  const playW = Math.max(280, vw - mainPad * 2)
  const playH = Math.max(280, vh - headerHeight - mainPad * 2)

  // Scale chrome with card size so squares stay proportional
  const estimateChrome = (card: number) => {
    const cardPad = Math.max(6, Math.round(card * 0.035))
    const cellGap = Math.max(3, Math.round(card * 0.018))
    const tileFont = Math.max(11, Math.min(17, Math.round(card * 0.048)))
    const selectionRowH = Math.max(22, Math.min(32, Math.round(card * 0.09)))
    const answerLineH = tileFont + Math.max(6, Math.round(tileFont * 0.55))
    const answersRowGap = Math.max(2, Math.round(cellGap * 0.35))
    const labelH = Math.round(tileFont * 1.15) + 2
    const answersPaneH = labelH + answerLineH * 4 + answersRowGap * 3 + 2
    const sectionGap = Math.max(2, Math.round(cellGap * 0.5))
    const chromeH =
      labelH +
      sectionGap +
      sectionGap +
      selectionRowH +
      sectionGap +
      Math.round(cellGap * 0.3) +
      answersPaneH

    // Center gap is intentional space: Categories fills nearly all of it
    const gridGap = Math.max(100, Math.round(card * 0.48))
    const categoryPad = Math.max(6, Math.round(gridGap * 0.06))
    const categorySize = Math.max(88, gridGap - 14)
    const categoryW = categorySize
    const categoryH = categorySize
    const categoryInner = categorySize - categoryPad * 2
    const categoryLabelH = Math.round(tileFont * 1.2) + 4
    const categoryRowGap = Math.max(3, Math.round(cellGap * 0.45))
    const categoryLineH = Math.max(
      answerLineH,
      Math.floor((categoryInner - categoryLabelH - categoryRowGap * 3 - 4) / 4)
    )

    return {
      cardPad,
      cellGap,
      tileFont,
      selectionRowH,
      answerLineH,
      answersRowGap,
      labelH,
      answersPaneH,
      chromeH,
      categoryPad,
      categoryW,
      categoryH,
      categoryLineH,
      categoryRowGap,
      gridGap,
    }
  }

  // Binary-search largest square card that fits: 2*card + gap ≤ playW/H
  let lo = 160
  let hi = Math.min(Math.floor(playW / 2), Math.floor(playH / 2), 420)
  let best = lo
  let bestChrome = estimateChrome(lo)

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const chrome = estimateChrome(mid)
    const totalW = mid * 2 + chrome.gridGap
    const totalH = mid * 2 + chrome.gridGap
    if (totalW <= playW && totalH <= playH) {
      best = mid
      bestChrome = chrome
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  // Square board inside square card: card = pad*2 + board + chrome
  let board = best - bestChrome.cardPad * 2 - bestChrome.chromeH
  if (board < 120) {
    // Prefer readable board: grow card if viewport allows, else accept smaller board
    const needed = 120 + bestChrome.cardPad * 2 + bestChrome.chromeH
    const chrome2 = estimateChrome(needed)
    const totalW = needed * 2 + chrome2.gridGap
    const totalH = needed * 2 + chrome2.gridGap
    if (totalW <= playW && totalH <= playH) {
      best = needed
      bestChrome = chrome2
      board = best - bestChrome.cardPad * 2 - bestChrome.chromeH
    } else {
      board = Math.max(100, board)
      // Re-lock card to exact square: pad*2 + board + chrome (may be slightly smaller than best)
      best = bestChrome.cardPad * 2 + board + bestChrome.chromeH
      bestChrome = estimateChrome(best)
      board = Math.max(100, best - bestChrome.cardPad * 2 - bestChrome.chromeH)
      best = bestChrome.cardPad * 2 + board + bestChrome.chromeH
    }
  } else {
    // Exact square identity
    best = bestChrome.cardPad * 2 + board + bestChrome.chromeH
  }

  // Final chrome pass at locked card size
  const chrome = estimateChrome(best)
  board = Math.max(100, best - chrome.cardPad * 2 - chrome.chromeH)
  const card = chrome.cardPad * 2 + board + chrome.chromeH
  const final = estimateChrome(card)
  board = Math.max(100, card - final.cardPad * 2 - final.chromeH)
  const outerCardSize = final.cardPad * 2 + board + final.chromeH

  return {
    headerHeight,
    mainPad,
    h1Size: Math.max(20, Math.min(28, Math.round(vh * 0.026))),
    gameMaxW: Math.min(playW, outerCardSize * 2 + final.gridGap),
    outerCardSize,
    outerBoardMax: board,
    ...final,
    answersPaneH: final.answersPaneH,
    categoryCardWidth: final.categoryW,
    categoryCardHeight: final.categoryH,
    categoryLineH: final.categoryLineH,
    categoryRowGap: final.categoryRowGap,
  }
}

function applyLayoutVars() {
  const vv = window.visualViewport
  const vw = Math.round(vv?.width ?? window.innerWidth)
  const vh = Math.round(vv?.height ?? window.innerHeight)
  const layout = solveSquareLayout(vw, vh)
  const root = document.documentElement.style

  root.setProperty("--app-header-height", `${layout.headerHeight}px`)
  root.setProperty("--app-header-pad", `${Math.max(4, Math.round(layout.headerHeight * 0.12))}px`)
  root.setProperty("--app-main-pad", `${layout.mainPad}px`)
  root.setProperty("--grid-gap", `${layout.gridGap}px`)
  root.setProperty("--cell-gap", `${layout.cellGap}px`)
  root.setProperty("--card-pad", `${layout.cardPad}px`)
  root.setProperty("--h1-size", `${layout.h1Size}px`)
  root.setProperty("--tile-font", `${layout.tileFont}px`)
  root.setProperty("--selection-row-h", `${layout.selectionRowH}px`)
  root.setProperty("--answers-pane-h", `${layout.answersPaneH}px`)
  root.setProperty("--answer-line-h", `${layout.answerLineH}px`)
  root.setProperty("--answers-row-gap", `${layout.answersRowGap}px`)
  root.setProperty("--card-chrome-h", `${layout.chromeH}px`)
  root.setProperty("--game-max-w", `${layout.gameMaxW}px`)
  root.setProperty("--outer-board-max", `${layout.outerBoardMax}px`)
  root.setProperty("--outer-card-size", `${layout.outerCardSize}px`)
  root.setProperty("--category-card-width", `${layout.categoryCardWidth}px`)
  root.setProperty("--category-card-height", `${layout.categoryCardHeight}px`)
  root.setProperty("--category-line-h", `${layout.categoryLineH}px`)
  root.setProperty("--category-row-gap", `${layout.categoryRowGap}px`)
  root.setProperty("--category-pad", `${layout.categoryPad}px`)
}

export default function App() {
  const pathname = usePathname()
  const [theme, toggleTheme] = useTheme()

  useLayoutEffect(() => {
    applyLayoutVars()
    const onResize = () => applyLayoutVars()
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    window.visualViewport?.addEventListener("resize", onResize)
    window.visualViewport?.addEventListener("scroll", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
      window.visualViewport?.removeEventListener("resize", onResize)
      window.visualViewport?.removeEventListener("scroll", onResize)
    }
  }, [])

  if (pathname === "/creator") {
    return <CreatorPage />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark">
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
          <div className="app-header-brand">
            <h1>GridLock</h1>
            <p>Find the links. Lock the grid.</p>
          </div>
          <div className="app-header-end">
            <a
              className="app-header-link"
              href="/creator"
              onClick={e => {
                e.preventDefault()
                navigate("/creator")
              }}
            >
              Set Daily Puzzle
            </a>
          </div>
        </div>
      </header>
      <main className="app-main">
        <GridLockGame />
      </main>
    </div>
  )
}
