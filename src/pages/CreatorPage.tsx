import React from "react"
import { PuzzleLoader } from "../components/PuzzleLoader"
import { navigate } from "../router"
import "./CreatorPage.css"

export function CreatorPage() {
  return (
    <div className="app creator-app">
      <header className="app-header creator-header">
        <div className="creator-header-row">
          <button type="button" className="creator-back" onClick={() => navigate("/")}>
            ← Play
          </button>
          <div className="creator-header-text">
            <h1>Puzzle Creator</h1>
            <p>Build a custom GridLock puzzle</p>
          </div>
        </div>
      </header>
      <main className="app-main creator-main">
        <PuzzleLoader onLoad={id => navigate(`/?p=${encodeURIComponent(id)}`)} />
      </main>
    </div>
  )
}
