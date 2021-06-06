import * as React from 'react'
import * as ReactDOM from 'react-dom'
import produce from 'immer'
import { WritableDraft } from 'immer/dist/types/types-external'

interface Cell {
  value: number | null; // how many mines around, is mine if is null
  visible: boolean;
  flagged: boolean;
  possibility: number;
}

const enum Difficulty {
  normal = 0,
  easy = 1,
  easier = 2,
  noBrain = 3
}

function App() {
  const [rowCount, setRowCount] = React.useState(16)
  const [columnCount, setColumnCount] = React.useState(30)
  const [mineCount, setMineCount] = React.useState(99)
  const [cells, setCells] = React.useState<Cell[][]>([])
  const [difficulty, setDifficulty] = React.useState(Difficulty.normal)
  const [failed, setFailed] = React.useState(false)

  const mainStyle = {
    height: rowCount * 30 + 'px',
    width: columnCount * 30 + 'px'
  }
  const cellsCount = rowCount * columnCount
  let remainMineCount = mineCount
  let remainUnknownCount = cellsCount
  for (const row of cells) {
    for (const cell of row) {
      if (cell.flagged) {
        remainMineCount--
        remainUnknownCount--
      } else if (cell.visible) {
        remainUnknownCount--
      }
    }
  }
  const averagePossibility = remainMineCount === 0 ? 0 : Math.round(remainMineCount * 100.0 / remainUnknownCount)

  const start = () => {
    const cells: Cell[][] = []
    for (let i = 0; i < rowCount; i++) {
      cells.push([])
      for (let j = 0; j < columnCount; j++) {
        cells[i].push({
          value: 0,
          visible: false,
          flagged: false,
          possibility: -1
        })
      }
    }

    let count = mineCount
    while (count > 0) {
      const index = Math.floor(Math.random() * cellsCount)
      const columnIndex = Math.floor(index / columnCount)
      const rowIndex = index - columnIndex * columnCount
      const cell = cells[columnIndex][rowIndex]
      if (cell.value !== null) {
        cell.value = null
        count--
      }
    }

    setCells(cells)
    setFailed(false)
  }
  const click = (rowIndex: number, columnIndex: number) => {
    setCells(produce(cells, (draft) => {
      probe(draft, rowIndex, columnIndex)
    }))
  }
  const contextmenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, rowIndex: number, columnIndex: number, flagged: boolean) => {
    setCells(produce(cells, (draft) => {
      flag(draft, rowIndex, columnIndex, flagged)
    }))
    e.preventDefault()
    return false
  }
  const flag = (draft: WritableDraft<Cell>[][], rowIndex: number, columnIndex: number, flagged: boolean) => {
    const cell = draft[rowIndex][columnIndex]
    if (!cell.visible) {
      if (flagged) {
        if (!cell.flagged) {
          cell.flagged = true
        }
      } else {
        if (cell.flagged) {
          cell.flagged = false
        }
      }
    }
  }
  const probe = (draft: WritableDraft<Cell>[][], rowIndex: number, columnIndex: number) => {
    const cell = draft[rowIndex][columnIndex]
    if (!cell.visible && !cell.flagged) {
      if (cell.value === null) {
        fail(draft)
      } else {
        cell.value = getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => draft[newRowIndex][newColumnIndex].value === null ? 1 : 0)
        cell.visible = true

        if (cell.value === 0) {
          aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => probe(draft, newRowIndex, newColumnIndex))
        }
      }
    }
  }
  const fail = (draft: WritableDraft<Cell>[][]) => {
    setFailed(true)
    for (const row of draft) {
      for (const cell of row) {
        if (cell.value === null) {
          cell.visible = true
        }
      }
    }
  }
  const getAroundCount = (rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => number) => {
    let count = 0
    const results = around(rowIndex, columnIndex, action)
    for (const result of results) {
      count += result
    }
    return count
  }
  const aroundAction = (rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => void) => {
    const results = around(rowIndex, columnIndex, action)
    while (!results.next().done) {
      // do nothing
    }
  }
  const getAroundPositions = (rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => Position | null) => {
    const positions: Position[] = []
    const results = around(rowIndex, columnIndex, action)
    for (const result of results) {
      if (result !== null) {
        positions.push(result)
      }
    }
    return positions
  }
  function* aroundIndex<T>(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => T) {
    if (rowIndex >= 0 && rowIndex < rowCount
      && columnIndex >= 0 && columnIndex < columnCount) {
      yield action(rowIndex, columnIndex)
    }
  }
  function* around<T>(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => T) {
    yield* aroundIndex(rowIndex - 1, columnIndex - 1, action)
    yield* aroundIndex(rowIndex - 1, columnIndex, action)
    yield* aroundIndex(rowIndex - 1, columnIndex + 1, action)
    yield* aroundIndex(rowIndex, columnIndex - 1, action)
    yield* aroundIndex(rowIndex, columnIndex + 1, action)
    yield* aroundIndex(rowIndex + 1, columnIndex - 1, action)
    yield* aroundIndex(rowIndex + 1, columnIndex, action)
    yield* aroundIndex(rowIndex + 1, columnIndex + 1, action)
  }
  function checkForEasy(draft: WritableDraft<Cell>[][]) {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const cell = draft[rowIndex][columnIndex]
        if (cell.visible && cell.value !== null && cell.value !== 0) { // only check its value if it is visible, or it is cheat
          const flaggedCount = getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && draft[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const unknownCount = getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && !draft[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const mineCount = cell.value - flaggedCount
          if (mineCount === unknownCount) {
            aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => flag(draft, newRowIndex, newColumnIndex, true))
          } else if (mineCount === 0) {
            aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => probe(draft, newRowIndex, newColumnIndex))
          }
        }
      }
    }
  }
  function checkForEasier(draft: WritableDraft<Cell>[][]) {
    const conditions: Condition[] = []
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const cell = draft[rowIndex][columnIndex]
        if (cell.visible && cell.value !== null && cell.value !== 0) { // only check its value if it is visible, or it is cheat
          const flaggedPositions = getAroundPositions(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && draft[newRowIndex][newColumnIndex].flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null)
          const unknownPositions = getAroundPositions(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && !draft[newRowIndex][newColumnIndex].flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null)
          const mineCount = cell.value - flaggedPositions.length
          if (mineCount > 0 && unknownPositions.length > 0) {
            conditions.push({
              positions: unknownPositions,
              mineCount
            })
          }
        }
      }
    }

    for (const condition1 of conditions) {
      for (const condition2 of conditions) {
        if (condition1.positions.length > condition2.positions.length
          && condition2.positions.every(p2 => condition1.positions.some(p1 => p1.rowIndex === p2.rowIndex && p1.columnIndex === p2.columnIndex))) {
          const mineCount = condition1.mineCount - condition2.mineCount
          const unknownCount = condition1.positions.length - condition2.positions.length
          if (mineCount === unknownCount) {
            const positions = condition1.positions.filter(p1 => condition2.positions.every(p2 => p1.rowIndex !== p2.rowIndex || p1.columnIndex !== p2.columnIndex))
            for (const position of positions) {
              flag(draft, position.rowIndex, position.columnIndex, true)
            }
          } else if (mineCount === 0) {
            const positions = condition1.positions.filter(p1 => condition2.positions.every(p2 => p1.rowIndex !== p2.rowIndex || p1.columnIndex !== p2.columnIndex))
            for (const position of positions) {
              probe(draft, position.rowIndex, position.columnIndex)
            }
          }
        }
      }
    }
  }
  function checkForNoBrain(draft: WritableDraft<Cell>[][]) {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const cell = draft[rowIndex][columnIndex]
        if (!cell.visible && !cell.flagged) {
          cell.possibility = -1
        }
      }
    }

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const cell = draft[rowIndex][columnIndex]
        if (cell.visible && cell.value !== null && cell.value !== 0) { // only check its value if it is visible, or it is cheat
          const flaggedCount = getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && draft[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const unknownCount = getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && !draft[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const mineCount = cell.value - flaggedCount

          const unknownPositions = getAroundPositions(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!draft[newRowIndex][newColumnIndex].visible && !draft[newRowIndex][newColumnIndex].flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null)
          for (const position of unknownPositions) {
            const unknownCell = draft[position.rowIndex][position.columnIndex]
            unknownCell.possibility = Math.max(unknownCell.possibility, Math.round(mineCount * 100.0 / unknownCount))
          }
        }
      }
    }
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (remainUnknownCount > 0 && !failed) {
        setCells(produce(cells, (draft) => {
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
  }, [difficulty, failed, cells])

  React.useEffect(() => {
    start()
  }, [])

  return (
    <div>
      <div className="control">
        <span title="mines">{remainMineCount}</span>
        <span title="unknown">{remainUnknownCount}</span>
        <span title="average possibility">{averagePossibility}</span>
        <input type="number" value={rowCount} onChange={(e) => setRowCount(+e.target.value)} title="row count" />
        <input type="number" value={columnCount} onChange={(e) => setColumnCount(+e.target.value)} title="column count" />
        <input type="number" value={mineCount} onChange={(e) => setMineCount(+e.target.value)} title="mine count" />
        <select value={difficulty} onChange={(e) => setDifficulty(+e.target.value)} title="difficulty">
          <option value="0">normal</option>
          <option value="1">easy</option>
          <option value="2">easier</option>
          <option value="3">no brain</option>
        </select>
        <button onClick={start}>restart</button>
      </div>
      <div className="main" style={mainStyle}>
        {cells.map((row, rowIndex) => row.map((cell, columnIndex) => {
          const key = `${rowIndex} ${columnIndex}`
          if (cell.visible) {
            if (cell.value === null) {
              return <div key={key} className="item mine"></div>
            }
            if (cell.value === 0) {
              return <div key={key} className="item"></div>
            }
            return <div key={key} className="item">{cell.value}</div>
          }
          if (cell.flagged) {
            return (
              <div
                key={key}
                className="item unknown"
                onContextMenu={(e) => contextmenu(e, rowIndex, columnIndex, false)}
              >&para;</div>
            )
          }
          return (
            <div
              key={key}
              className="item unknown"
              onClick={() => click(rowIndex, columnIndex)}
              onContextMenu={(e) => contextmenu(e, rowIndex, columnIndex, true)}
              style={{
                color: difficulty >= 3 && cell.possibility > averagePossibility ? 'red' : undefined,
              }}
            >
              {(difficulty >= 3 && cell.possibility >= 0) ? cell.possibility : ""}
            </div>
          )
        }))}
      </div>
    </div>
  )
}

interface Position {
  rowIndex: number;
  columnIndex: number;
}

interface Condition {
  positions: Position[];
  mineCount: number;
}

ReactDOM.render(<App />, document.getElementById('container'))

if (navigator.serviceWorker && !location.host.startsWith('localhost')) {
  navigator.serviceWorker.register('service-worker.bundle.js').catch((error: Error) => {
    console.log('registration failed with error: ' + error)
  })
}
