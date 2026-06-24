import { useEffect, useState } from "react"

export function getPathname(): string {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  return path
}

export function navigate(to: string) {
  const url = to.startsWith("/") ? to : `/${to}`
  window.history.pushState({}, "", url)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const sync = () => setPathname(getPathname())
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  return pathname
}
