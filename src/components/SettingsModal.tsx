import React, {useState} from 'react'

export default function SettingsModal({
  deepDefault,
  restDefault,
  onClose,
  onApply
}: {
  deepDefault: number
  restDefault: number
  onClose: () => void
  onApply: (deepMin: number, restMin: number) => void
}) {
  const [deep, setDeep] = useState(String(deepDefault))
  const [rest, setRest] = useState(String(restDefault))

  function apply() {
    const d = Math.max(1, Number(parseInt(deep) || deepDefault))
    const r = Math.max(1, Number(parseInt(rest) || restDefault))
    onApply(d, r)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h2>Settings</h2>
        </header>
        <div className="modal-body">
          <label>
            Deep work length (minutes)
            <input type="number" min={1} value={deep} onChange={e => setDeep(e.target.value)} />
          </label>
          <label>
            Rest length (minutes)
            <input type="number" min={1} value={rest} onChange={e => setRest(e.target.value)} />
          </label>
        </div>
        <footer className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={apply}>Save</button>
        </footer>
      </div>
    </div>
  )
}
