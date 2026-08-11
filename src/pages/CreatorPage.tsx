import React from "react"
import { PuzzleLoader } from "../components/PuzzleLoader"
import { navigate } from "../router"
import { useTheme } from "../theme"
import "./CreatorPage.css"

export function CreatorPage() {
  const [theme, toggleTheme] = useTheme()

  return (
    <div className="app creator-app">
      <header className="app-header creator-header">
        <div className="creator-header-row">
          <button type="button" className="creator-back" onClick={() => navigate("/")}>
            ← Play
          </button>
          <div className="creator-header-text">
            <h1>Daily Puzzle Creator</h1>
            <p>Set GridLock puzzles by date</p>
          </div>
          <button type="button" className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>
      <main className="app-main creator-main">
        <PuzzleLoader onLoad={id => navigate(`/?p=${encodeURIComponent(id)}`)} />
      </main>
    </div>
  )
}
