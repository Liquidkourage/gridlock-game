import React, { useEffect } from "react"
import "./App.css"
import { GridLockGame } from "./components/GridLockGame"

export default function App() {
  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Global scale factor currently in use
    const SCALE = 1.15

    // Base outer grid sizing (current baseline before adjustment)
    let outerGridW = Math.round(vw * 0.32)
    let outerGridH = Math.round(vh * 0.24)

    // Apply scale-up then shrink main grids by 10%
    outerGridW = Math.round(outerGridW * SCALE * 0.9)
    outerGridH = Math.round(outerGridH * SCALE * 0.9)

    // Header compact
    const headerHeight = Math.max(56, Math.round(vh * 0.07))
    const headerPad = Math.round(headerHeight * 0.2)

    // Spacing
    const mainPadBase = Math.max(6, Math.round(vh * 0.012))
    const mainPad = Math.round(mainPadBase * 1.2) // more breathing room overall
    const gridGapBase = Math.max(8, Math.round(vw * 0.01))
    const gridGap = Math.round(gridGapBase * 1.12) // a little more space between all grids
    const cellGap = Math.max(6, Math.round(vw * 0.006))
    const topSpacer = Math.max(10, Math.round(vh * 0.02))
    const cardPad = Math.max(12, Math.round(vh * 0.018)) // inner card padding bump

    // Selection row height (proportional to outer grid height)
    let selectionRowH = Math.max(24, Math.round(outerGridH * 0.10))

    // Typography (depending on outer grid height)
    const h1Size = Math.max(24, Math.round(vh * 0.052))
    const h3Size = Math.max(14, Math.round(vh * 0.016))
    let blockFont = Math.max(12, Math.round(outerGridH * 0.035 * 1.25)) // bump text in cells ~25%
    let selectionFont = Math.max(12, Math.round(selectionRowH * 0.45))

    // Compute heights
    const mainHeight = vh - headerHeight
    const overhead = gridGap + (2 * mainPad) + topSpacer

    // Remaining space below the two outer grid rows
    const availableAfterOverhead = Math.max(0, mainHeight - overhead)
    const leftoverAfterTwo = Math.max(0, availableAfterOverhead - (2 * outerGridH))

    // Final grid desired height (near-full leftover) then shrink by 25%
    const desiredBaseline = Math.max(160, Math.round(vh * 0.22))
    const nearFullLeftover = Math.round(leftoverAfterTwo * 0.94)
    const desiredMiddleRaw = Math.max(desiredBaseline, nearFullLeftover)
    const desiredMiddle = Math.round(desiredMiddleRaw * 0.75) // shrink 25%

    // Final grid dimensions
    const middleHeight = Math.min(desiredMiddle, leftoverAfterTwo)

    // Grid section height (two rows + gap)
    const gridSectionPx = (2 * outerGridH) + gridGap

    // Final grid width cap equals two grids + gap (align edges exactly)
    const twoGridWidth = (2 * outerGridW) + gridGap
    const middleMaxW = Math.round(twoGridWidth)

    const root = document.documentElement.style
    root.setProperty("--app-header-height", `${headerHeight}px`)
    root.setProperty("--app-header-pad", `${headerPad}px`)
    root.setProperty("--app-main-pad", `${mainPad}px`)

    root.setProperty("--outer-grid-w", `${outerGridW}px`)
    root.setProperty("--outer-grid-h", `${outerGridH}px`)

    root.setProperty("--grid-gap", `${gridGap}px`)
    root.setProperty("--cell-gap", `${cellGap}px`)
    root.setProperty("--top-spacer", `${topSpacer}px`)
    root.setProperty("--card-pad", `${cardPad}px`)

    root.setProperty("--selection-row-h", `${selectionRowH}px`)
    root.setProperty("--h1-size", `${h1Size}px`)
    root.setProperty("--h3-size", `${h3Size}px`)
    root.setProperty("--block-font", `${blockFont}px`)
    root.setProperty("--selection-font", `${selectionFont}px`)

    root.setProperty("--grid-section-px", `${gridSectionPx}px`)
    root.setProperty("--middle-height", `${middleHeight}px`)
    root.setProperty("--middle-max-w", `${middleMaxW}px`)
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


