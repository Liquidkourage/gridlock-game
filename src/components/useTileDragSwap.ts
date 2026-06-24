import { useCallback, useRef, useState, type DragEvent } from "react"

export function useTileDragSwap(onSwap: (fromKey: string, toKey: string) => void) {
  const dragKeyRef = useRef<string | null>(null)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropKey, setDropKey] = useState<string | null>(null)
  const suppressClickRef = useRef(false)

  const bindTile = useCallback(
    (key: string, disabled: boolean) => ({
      draggable: !disabled,
      onDragStart: (e: DragEvent) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        dragKeyRef.current = key
        setDragKey(key)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", key)
      },
      onDragOver: (e: DragEvent) => {
        if (disabled) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDropKey(key)
      },
      onDragLeave: () => {
        setDropKey(prev => (prev === key ? null : prev))
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        const from = dragKeyRef.current || e.dataTransfer.getData("text/plain")
        dragKeyRef.current = null
        setDragKey(null)
        setDropKey(null)
        if (!from || from === key || disabled) return
        suppressClickRef.current = true
        onSwap(from, key)
      },
      onDragEnd: () => {
        dragKeyRef.current = null
        setDragKey(null)
        setDropKey(null)
      },
    }),
    [onSwap]
  )

  const tileClass = useCallback(
    (key: string, disabled: boolean) => {
      if (disabled) return ""
      if (dragKey === key) return " dragging"
      if (dropKey === key && dragKey !== key) return " drop-target"
      return ""
    },
    [dragKey, dropKey]
  )

  return { bindTile, tileClass, suppressClickRef }
}
