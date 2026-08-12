import React, { useLayoutEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"
import { CreatorPage } from "./pages/CreatorPage"
import { navigate, usePathname } from "./router"
import { useTheme } from "./theme"

/**
 * Board-first layout:
 * - 4×4 board and cells stay square
 * - Cards are NOT forced square (chrome sits below the board) so boards can grow
 * - Center gap sized to fit Categories without starving the grids
 */
function solvePlayLayout(vw: number, vh: number) {
  const isMobile = vw < 720
  const headerHeight = isMobile
    ? Math.max(40, Math.min(48, Math.round(vh * 0.055)))
    : Math.max(36, Math.min(48, Math.round(vh * 0.045)))
  const mainPad = isMobile
    ? Math.max(6, Math.round(vw * 0.02))
    : Math.max(4, Math.round(Math.min(vw, vh) * 0.008))

  const playW = Math.max(280, vw - mainPad * 2)
  const playH = Math.max(240, vh - headerHeight - mainPad * 2)

  const chromeFor = (board: number) => {
    const cardPad = Math.max(6, Math.min(14, Math.round(board * 0.04)))
    const cellGap = Math.max(3, Math.min(8, Math.round(board * 0.022)))
    // Readable tile type scales with board (~cell size * 0.42)
    const tileFont = Math.max(12, Math.min(22, Math.round(board * 0.095)))
    const selectionRowH = Math.max(24, Math.min(34, Math.round(board * 0.1)))
    const answerLineH = Math.max(14, Math.min(22, Math.round(tileFont * 0.95)))
    const answersRowGap = Math.max(2, Math.round(cellGap * 0.35))
    const labelH = Math.max(12, Math.round(tileFont * 0.85))
    const answersPaneH = labelH + answerLineH * 4 + answersRowGap * 3 + 4
    const sectionGap = Math.max(2, Math.round(cellGap * 0.45))
    const chromeH =
      labelH +
      sectionGap +
      sectionGap +
      selectionRowH +
      sectionGap +
      Math.round(cellGap * 0.25) +
      answersPaneH

    const cardW = board + cardPad * 2
    const cardH = board + cardPad * 2 + chromeH

    // Tighter center gap — Categories fills it, but doesn't dominate
    const gridGap = isMobile
      ? Math.max(12, Math.round(cellGap * 2))
      : Math.max(96, Math.min(168, Math.round(Math.min(cardW, cardH) * 0.28)))

    const categoryPad = Math.max(5, Math.round(gridGap * 0.06))
    const categorySize = Math.max(80, gridGap - 12)
    const categoryInner = categorySize - categoryPad * 2
    const categoryLabelH = Math.max(12, Math.round(tileFont * 0.9))
    const categoryRowGap = Math.max(2, Math.round(cellGap * 0.4))
    const categoryLineH = Math.max(
      14,
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
      cardW,
      cardH,
      gridGap,
      categoryPad,
      categoryW: categorySize,
      categoryH: categorySize,
      categoryLineH,
      categoryRowGap,
    }
  }

  let board: number
  let layout = chromeFor(160)

  if (isMobile) {
    // Full-width board; page may scroll vertically
    board = Math.max(200, Math.min(playW - 4, Math.floor(playW * 0.96)))
    layout = chromeFor(board)
    // If a single card is taller than viewport, still OK (scroll) — keep board wide
  } else {
    // Binary-search largest board that fits 2×2 + gap in the play area
    let lo = 140
    let hi = Math.min(Math.floor(playW / 2), Math.floor(playH / 2), 380)
    let best = lo
    let bestLayout = chromeFor(lo)

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const L = chromeFor(mid)
      const totalW = L.cardW * 2 + L.gridGap
      const totalH = L.cardH * 2 + L.gridGap
      if (totalW <= playW && totalH <= playH) {
        best = mid
        bestLayout = L
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    board = best
    layout = bestLayout
  }

  return {
    isMobile,
    headerHeight,
    mainPad,
    h1Size: Math.max(18, Math.min(26, Math.round(vh * 0.024))),
    gameMaxW: isMobile
      ? playW
      : Math.min(playW, layout.cardW * 2 + layout.gridGap),
    outerBoardMax: board,
    outerCardWidth: layout.cardW,
    outerCardHeight: layout.cardH,
    ...layout,
    categoryCardWidth: layout.categoryW,
    categoryCardHeight: layout.categoryH,
  }
}

function applyLayoutVars() {
  const vv = window.visualViewport
  const vw = Math.round(vv?.width ?? window.innerWidth)
  const vh = Math.round(vv?.height ?? window.innerHeight)
  const layout = solvePlayLayout(vw, vh)
  const root = document.documentElement.style

  document.documentElement.dataset.layout = layout.isMobile ? "mobile" : "desktop"

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
  // Legacy alias: some CSS still referenced square card size — map to width
  root.setProperty("--outer-card-size", `${layout.outerCardWidth}px`)
  root.setProperty("--outer-card-width", `${layout.outerCardWidth}px`)
  root.setProperty("--outer-card-height", `${layout.outerCardHeight}px`)
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
