import * as React from 'react'
import * as ReactDOM from 'react-dom'
import produce from 'immer'

import { checkForEasier, checkForEasy, checkForNoBrain, flag, MineSweeper, probe, start } from './mine-sweeper'

const enum Difficulty {
  normal = 0,
  easy = 1,
  easier = 2,
  noBrain = 3
}

function App() {
  const [difficulty, setDifficulty] = React.useState(Difficulty.normal)
  const [mineSweeper, setMineSweeper] = React.useState(new MineSweeper())

  const contextmenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, rowIndex: number, columnIndex: number, flagged: boolean) => {
    setMineSweeper(produce(mineSweeper, (draft) => {
      flag(draft, rowIndex, columnIndex, flagged)
    }))
    e.preventDefault()
    return false
  }

  const restart = () => setMineSweeper(produce(mineSweeper, start))

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (mineSweeper.remainUnknownCount > 0 && !mineSweeper.failed) {
        setMineSweeper(produce(mineSweeper, (draft) => {
          if (difficulty >= Difficulty.easy) {
            checkForEasy(draft)
          }
          if (difficulty >= Difficulty.easier) {
            checkForEasier(draft)
          }
          if (difficulty >= Difficulty.noBrain) {
            checkForNoBrain(draft)
          }
        }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [mineSweeper, difficulty])

  React.useEffect(() => {
    restart()
  }, [])

  return (
    <div>
      <div className="control">
        <span title="mines">{mineSweeper.remainMineCount}</span>
        <span title="unknown">{mineSweeper.remainUnknownCount}</span>
        <span title="average possibility">{mineSweeper.averagePossibility}</span>
        <input
          type="number"
          value={mineSweeper.rowCount}
          onChange={(e) => setMineSweeper(produce(mineSweeper, (draft) => {
            draft.rowCount = +e.target.value
            start(draft)
          }))}
          title="row count"
        />
        <input
          type="number"
          value={mineSweeper.columnCount}
          onChange={(e) => setMineSweeper(produce(mineSweeper, (draft) => {
            draft.columnCount = +e.target.value
            start(draft)
          }))}
          title="column count"
        />
        <input
          type="number"
          value={mineSweeper.mineCount}
          onChange={(e) => setMineSweeper(produce(mineSweeper, (draft) => {
            draft.mineCount = +e.target.value
            start(draft)
          }))}
          title="mine count"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(+e.target.value)}
          title="difficulty"
        >
          <option value="0">normal</option>
          <option value="1">easy</option>
          <option value="2">easier</option>
          <option value="3">no brain</option>
        </select>
        <button onClick={restart}>restart</button>
      </div>
      <div
        className="main"
        style={{
          height: mineSweeper.rowCount * 30 + 'px',
          width: mineSweeper.columnCount * 30 + 'px'
        }}
      >
        {mineSweeper.cells.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, columnIndex) => {
              if (cell.visible) {
                if (cell.value === null) {
                  return <div key={columnIndex} className="item mine"></div>
                }
                if (cell.value === 0) {
                  return <div key={columnIndex} className="item"></div>
                }
                return <div key={columnIndex} className="item">{cell.value}</div>
              }
              if (cell.flagged) {
                return (
                  <div
                    key={columnIndex}
                    className="item unknown"
                    onContextMenu={(e) => contextmenu(e, rowIndex, columnIndex, false)}
                  >&para;</div>
                )
              }
              return (
                <div
                  key={columnIndex}
                  className="item unknown"
                  onClick={() => {
                    setMineSweeper(produce(mineSweeper, (draft) => {
                      probe(draft, rowIndex, columnIndex)
                    }))
                  }}
                  onContextMenu={(e) => contextmenu(e, rowIndex, columnIndex, true)}
                  style={{
                    color: difficulty >= 3 && cell.possibility > mineSweeper.averagePossibility ? 'red' : undefined,
                  }}
                >
                  {(difficulty >= 3 && cell.possibility >= 0) ? cell.possibility : ""}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('container'))

if (navigator.serviceWorker && !location.host.startsWith('localhost')) {
  navigator.serviceWorker.register('service-worker.bundle.js').catch((error: Error) => {
    console.log('registration failed with error: ' + error)
  })
}
