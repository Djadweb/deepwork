import React from 'react'

export default function HistoryGrid({ totalSeconds }: { totalSeconds: number }) {
  // represent each square as 15 minutes of deep work
  const minutesPerSquare = 15
  // compute filled squares from seconds to avoid minute-rounding off-by-one
  const filledCount = Math.floor(totalSeconds / (minutesPerSquare * 60))

  // capacity: how many squares to render in total (fixed, larger grid)
  const capacity = 400 // e.g. 20 cols x 20 rows = 400 squares
  const cols = 40
  const rows = Math.ceil(capacity / cols)

  const filled = Math.min(filledCount, capacity)
  const squares = Array.from({ length: rows * cols }).map((_, i) => i < filled)

  return (
    <div className="history-grid" aria-hidden={false}>
      <div className="grid" role="img" aria-label={`Deep work history: ${filledCount} minutes`}>
        {squares.map((isFilled, i) => (
          <div key={i} className={`sq ${isFilled ? 'filled' : ''}`} />
        ))}
      </div>
    </div>
  )
}
