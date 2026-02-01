import React, {useCallback, useEffect, useRef, useState} from 'react'
import SettingsModal from './components/SettingsModal'
import HistoryGrid from './components/HistoryGrid'
import TodoList from './components/TodoList'

import './index.css'

type Mode = 'deep' | 'rest'

const LS_KEYS = {
  deepDefault: 'dw:deepDefault',
  restDefault: 'dw:restDefault',
  totalDeepSeconds: 'dw:totalDeepSeconds',
  mode: 'dw:mode',
  remainingDeep: 'dw:remainingDeep',
  remainingRest: 'dw:remainingRest',
  running: 'dw:running',
  elapsed: 'dw:elapsed',
  lastTick: 'dw:lastTick'
}

function secToClock(s: number) {
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function App() {
  const [mode, setMode] = useState<Mode>(() => {
    const v = localStorage.getItem(LS_KEYS.mode)
    return (v === 'deep' || v === 'rest') ? v : 'deep'
  })
  const [deepDefaultMin, setDeepDefaultMin] = useState<number>(() => {
    const v = localStorage.getItem(LS_KEYS.deepDefault)
    return v ? Number(v) : 60
  })
  const [restDefaultMin, setRestDefaultMin] = useState<number>(() => {
    const v = localStorage.getItem(LS_KEYS.restDefault)
    return v ? Number(v) : 15
  })
  const [running, setRunning] = useState(() => {
    const v = localStorage.getItem(LS_KEYS.running)
    return v === 'true'
  })
  const [remainingDeep, setRemainingDeep] = useState<number>(() => {
    const v = localStorage.getItem(LS_KEYS.remainingDeep)
    const deepDef = localStorage.getItem(LS_KEYS.deepDefault)
    const deepDefaultMinVal = deepDef ? Number(deepDef) : 60
    return v ? Number(v) : deepDefaultMinVal * 60
  })
  const [remainingRest, setRemainingRest] = useState<number>(() => {
    const v = localStorage.getItem(LS_KEYS.remainingRest)
    const restDef = localStorage.getItem(LS_KEYS.restDefault)
    const restDefaultMinVal = restDef ? Number(restDef) : 15
    return v ? Number(v) : restDefaultMinVal * 60
  })
  const [showSettings, setShowSettings] = useState(false)
  const [totalDeepSeconds, setTotalDeepSeconds] = useState<number>(() => {
    const v = localStorage.getItem(LS_KEYS.totalDeepSeconds)
    return v ? Number(v) : 0
  })

  const elapsedRef = useRef(0)
  const intervalRef = useRef<number | null>(null)
  const prevDeepDefault = useRef<number | null>(null)
  const prevRestDefault = useRef<number | null>(null)

  // On mount: restore session state from localStorage
  useEffect(() => {
    // Restore elapsed time
    const savedElapsed = localStorage.getItem(LS_KEYS.elapsed)
    if (savedElapsed) {
      elapsedRef.current = Number(savedElapsed)
    }

    // Catch up if page was closed while timer was running
    const wasRunning = localStorage.getItem(LS_KEYS.running) === 'true'
    const lastTick = localStorage.getItem(LS_KEYS.lastTick)
    const savedMode = (localStorage.getItem(LS_KEYS.mode) as Mode) || 'deep'
    if (wasRunning && lastTick) {
      const elapsed = Math.floor((Date.now() - Number(lastTick)) / 1000)
      if (savedMode === 'deep') {
        setRemainingDeep(d => Math.max(0, d - elapsed))
      } else {
        setRemainingRest(r => Math.max(0, r - elapsed))
      }
    }
  }, [])

  // Persist mode
  useEffect(() => {
    localStorage.setItem(LS_KEYS.mode, mode)
  }, [mode])

  // Persist remaining per mode
  useEffect(() => {
    localStorage.setItem(LS_KEYS.remainingDeep, String(remainingDeep))
  }, [remainingDeep])
  useEffect(() => {
    localStorage.setItem(LS_KEYS.remainingRest, String(remainingRest))
  }, [remainingRest])

  // Persist running
  useEffect(() => {
    localStorage.setItem(LS_KEYS.running, String(running))
  }, [running])

  // Persist elapsed
  useEffect(() => {
    localStorage.setItem(LS_KEYS.elapsed, String(elapsedRef.current))
  }, [remainingDeep, remainingRest]) // update on every tick

  // When defaults change, update the corresponding remaining only when not running
  // Skip on initial mount by tracking previous default values
  useEffect(() => {
    if (prevDeepDefault.current === null) {
      prevDeepDefault.current = deepDefaultMin
      return
    }
    if (!running) setRemainingDeep(deepDefaultMin * 60)
    prevDeepDefault.current = deepDefaultMin
  }, [deepDefaultMin])
  useEffect(() => {
    if (prevRestDefault.current === null) {
      prevRestDefault.current = restDefaultMin
      return
    }
    if (!running) setRemainingRest(restDefaultMin * 60)
    prevRestDefault.current = restDefaultMin
  }, [restDefaultMin])

  useEffect(() => {
    localStorage.setItem(LS_KEYS.deepDefault, String(deepDefaultMin))
  }, [deepDefaultMin])

  useEffect(() => {
    localStorage.setItem(LS_KEYS.restDefault, String(restDefaultMin))
  }, [restDefaultMin])

  useEffect(() => {
    localStorage.setItem(LS_KEYS.totalDeepSeconds, String(totalDeepSeconds))
  }, [totalDeepSeconds])

  useEffect(() => {
    if (running) {
      localStorage.setItem(LS_KEYS.lastTick, String(Date.now()))
      intervalRef.current = window.setInterval(() => {
        localStorage.setItem(LS_KEYS.lastTick, String(Date.now()))
        if (mode === 'deep') {
          setRemainingDeep(d => {
            if (d <= 1) {
              setTotalDeepSeconds(t => t + (elapsedRef.current + 1))
              elapsedRef.current = 0
              localStorage.setItem(LS_KEYS.elapsed, '0')
              setRunning(false)
              setMode(m => (m === 'deep' ? 'rest' : 'deep'))
              return 0
            }
            elapsedRef.current += 1
            localStorage.setItem(LS_KEYS.elapsed, String(elapsedRef.current))
            return d - 1
          })
        } else {
          setRemainingRest(r => {
            if (r <= 1) {
              // finishing rest
              elapsedRef.current = 0
              localStorage.setItem(LS_KEYS.elapsed, '0')
              setRunning(false)
              setMode(m => (m === 'deep' ? 'rest' : 'deep'))
              return 0
            }
            elapsedRef.current += 1
            localStorage.setItem(LS_KEYS.elapsed, String(elapsedRef.current))
            return r - 1
          })
        }
      }, 1000)
    } else {
      localStorage.removeItem(LS_KEYS.lastTick)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running, mode])

  

  const toggleRunning = useCallback(() => {
    if (running) {
      // currently running -> pause only
      setRunning(false)
      return
    }
    // currently paused/stopped -> starting: if remaining is 0, reset to default
    if (mode === 'deep' && remainingDeep === 0) setRemainingDeep(deepDefaultMin * 60)
    if (mode === 'rest' && remainingRest === 0) setRemainingRest(restDefaultMin * 60)
    setRunning(true)
  }, [running, remainingDeep, remainingRest, mode, deepDefaultMin, restDefaultMin])

  useEffect(() => {
    // keyboard: space toggles start/pause
    const onKey = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      
      if (e.code === 'Space') {
        e.preventDefault()
        toggleRunning()
      }
      if (e.key === 's') setShowSettings(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleRunning])

  const resetTimer = useCallback(() => {
    setRunning(false)
    elapsedRef.current = 0
    if (mode === 'deep') setRemainingDeep(deepDefaultMin * 60)
    else setRemainingRest(restDefaultMin * 60)
  }, [mode, deepDefaultMin, restDefaultMin])

  const openSettings = useCallback(() => {
    setShowSettings(true)
  }, [])

  const applySettings = useCallback((newDeepMin: number, newRestMin: number) => {
    setDeepDefaultMin(newDeepMin)
    setRestDefaultMin(newRestMin)
    setShowSettings(false)
    // if not running, update remaining to new defaults for current mode
    if (!running) {
      if (mode === 'deep') setRemainingDeep(newDeepMin * 60)
      else setRemainingRest(newRestMin * 60)
    }
  }, [running, mode])

  const deepMinutes = Math.floor(totalDeepSeconds / 60)

  const currentRemaining = mode === 'deep' ? remainingDeep : remainingRest
  useEffect(() => {
    const timeText = secToClock(currentRemaining || 0)
    const modeText = mode === 'deep' ? 'Work' : 'Rest'
    const paused = running ? '' : ' (paused)'
    const newTitle = `${timeText} — ${modeText}${paused}`
    const prev = document.title
    document.title = newTitle
    return () => { document.title = prev }
  }, [currentRemaining, mode, running])

  return (
    <div className="app-root">
      <main className="center">
        <div className="timer-card">
          <div className="timer-header">
            <div className="brand">deep work depot</div>
            <button className="btn ghost" onClick={openSettings} aria-label="Open settings">settings</button>
          </div>


          <div className="mode-switch">
            <button className={`pill ${mode === 'deep' ? 'active' : ''}`} onClick={() => { setMode('deep'); setRunning(false) }}>work</button>
            <button className={`pill ${mode === 'rest' ? 'active' : ''}`} onClick={() => { setMode('rest'); setRunning(false) }}>rest</button>
          </div>

          <div className="time-display" role="timer" aria-live="polite">{secToClock(currentRemaining || 0)}</div>

          <div className="controls">
            <button className="btn primary" onClick={toggleRunning}>{running ? 'pause' : 'start'}</button>
            <button className="btn" onClick={resetTimer}>reset</button>
          </div>
        </div>

        <section className="history">
          <h3>time spent deep working</h3>
          <HistoryGrid totalSeconds={totalDeepSeconds} />
        </section>

        <TodoList />
      </main>

      {showSettings && (
        <SettingsModal
          deepDefault={deepDefaultMin}
          restDefault={restDefaultMin}
          onClose={() => setShowSettings(false)}
          onApply={applySettings}
        />
      )}
    </div>
  )
}
