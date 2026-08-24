import { useState, useRef, useEffect, useCallback } from "react"
import { CheckSquare, Square, ClipboardList, ChevronDown, ChevronUp, Home } from "lucide-react"
import { useChecklist, CHECKLIST_ITEMS } from "./ChecklistContext"

interface ChecklistNavProps {
  onGoHome: () => void
}

export function ChecklistNav({ onGoHome }: ChecklistNavProps) {
  const ctx = useChecklist()
  const [expanded, setExpanded] = useState(true)
  const [pos, setPos] = useState({ x: 16, y: 120 })
  const [dragging, setDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileOpen, setMobileOpen] = useState(false)

  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const prevDoneRef = useRef(0)

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    function onMove(e: MouseEvent) {
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      const panel = panelRef.current
      const pw = panel?.offsetWidth ?? 260
      const ph = panel?.offsetHeight ?? 300
      const nx = Math.max(0, Math.min(window.innerWidth - pw, dragStart.current.px + dx))
      const ny = Math.max(0, Math.min(window.innerHeight - ph, dragStart.current.py + dy))
      setPos({ x: nx, y: ny })
    }
    function onUp() { setDragging(false) }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [dragging])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    const t = e.touches[0]
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y }
    function onMove(ev: TouchEvent) {
      const tt = ev.touches[0]
      const dx = tt.clientX - dragStart.current.mx
      const dy = tt.clientY - dragStart.current.my
      const panel = panelRef.current
      const pw = panel?.offsetWidth ?? 260
      const ph = panel?.offsetHeight ?? 300
      const nx = Math.max(0, Math.min(window.innerWidth - pw, dragStart.current.px + dx))
      const ny = Math.max(0, Math.min(window.innerHeight - ph, dragStart.current.py + dy))
      setPos({ x: nx, y: ny })
    }
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", () => window.removeEventListener("touchmove", onMove), { once: true })
  }, [pos])

  if (!ctx?.profile) return null
  const items = CHECKLIST_ITEMS[ctx.profile]
  const done = items.filter((it) => ctx.completedItems.has(it.id)).length
  const total = items.length

  // Reabre o roteiro no mobile quando um novo item é concluído
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isMobile && done > prevDoneRef.current) {
      setMobileOpen(true)
    }
    prevDoneRef.current = done
  }, [done, isMobile])

  // Mobile: FAB button + painel slide-up
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-slate-800 text-white shadow-lg px-4 py-2.5 text-sm font-medium"
        >
          <ClipboardList className="h-4 w-4" />
          {done}/{total}
          {done < total && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
            <div className="relative bg-white rounded-t-2xl shadow-2xl w-full max-h-[65vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Roteiro de navegação</p>
                  <p className="text-xs text-slate-400">{done} de {total} etapas concluídas</p>
                </div>
                <button
                  type="button"
                  onClick={onGoHome}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  <Home className="h-3.5 w-3.5" /> Início
                </button>
              </div>

              <div className="px-5 pt-3 pb-2 shrink-0">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="overflow-y-auto px-5 pb-6 space-y-3">
                {items.map((item) => {
                  const checked = ctx.completedItems.has(item.id)
                  return (
                    <div key={item.id} className={`flex items-center gap-2.5 text-sm py-1 ${checked ? "text-emerald-700" : "text-slate-600"}`}>
                      {checked
                        ? <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                        : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
                      <span className={checked ? "line-through opacity-60" : ""}>{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop: painel flutuante arrastável
  return (
    <div
      ref={panelRef}
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 50, width: 256, userSelect: "none" }}
      className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="text-xs font-semibold">Roteiro de navegação</span>
        </div>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="ml-2 text-white/70 hover:text-white">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">{done} de {total} etapas</span>
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
              >
                <Home className="h-3 w-3" /> Início
              </button>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
            </div>
          </div>
          {items.map((item) => {
            const checked = ctx.completedItems.has(item.id)
            return (
              <div key={item.id} className={`flex items-start gap-2 text-xs ${checked ? "text-emerald-700" : "text-slate-600"}`}>
                {checked
                  ? <CheckSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  : <Square className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />}
                <span className={checked ? "line-through opacity-60 leading-relaxed" : "leading-relaxed"}>{item.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
