import { immerable } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"

/**
 * @public
 */
export class MineSweeper {
  [immerable] = true

  rowCount = 16
  columnCount = 30
  mineCount = 99
  cells: Cell[][] = []
  failed = false

  public get cellsCount(): number {
    return this.rowCount * this.columnCount
  }
  public get remainMineCount(): number {
    let remainMineCount = this.mineCount
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.flagged) {
          remainMineCount--
        }
      }
    }
    return remainMineCount
  }
  public get remainUnknownCount(): number {
    let remainUnknownCount = this.cellsCount
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.flagged || cell.visible) {
          remainUnknownCount--
        }
      }
    }
    return remainUnknownCount
  }
  public get averagePossibility(): number {
    return this.remainMineCount === 0 ? 0 : Math.round(this.remainMineCount * 100.0 / this.remainUnknownCount)
  }
}

/**
 * @public
 */
export function start(draft: WritableDraft<MineSweeper>): void {
  const mineCells: (number | null)[][] = []
  for (let i = 0; i < draft.rowCount; i++) {
    mineCells.push([])
    for (let j = 0; j < draft.columnCount; j++) {
      mineCells[i].push(0)
    }
  }

  let count = draft.mineCount
  while (count > 0) {
    const index = Math.floor(Math.random() * draft.cellsCount)
    const columnIndex = Math.floor(index / draft.columnCount)
    const rowIndex = index - columnIndex * draft.columnCount
    const cell = mineCells[columnIndex][rowIndex]
    if (cell !== null) {
      mineCells[columnIndex][rowIndex] = null
      count--
    }
  }

  for (let i = 0; i < draft.rowCount; i++) {
    for (let j = 0; j < draft.columnCount; j++) {
      const cell = mineCells[i][j]
      if (cell !== null) {
        mineCells[i][j] = getAroundCount(
          i,
          j,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => mineCells[newRowIndex][newColumnIndex] === null ? 1 : 0,
        )
      }
    }
  }

  const cells: Cell[][] = []
  for (let i = 0; i < draft.rowCount; i++) {
    cells.push([])
    for (let j = 0; j < draft.columnCount; j++) {
      cells[i].push(new Cell(mineCells[i][j]))
    }
  }

  draft.cells = cells
  draft.failed = false
}

/**
 * @public
 */
export function flag(draft: WritableDraft<MineSweeper>, rowIndex: number, columnIndex: number, flagged: boolean): void {
  const cell = draft.cells[rowIndex][columnIndex]
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

/**
 * @public
 */
export function checkForEasy(draft: WritableDraft<MineSweeper>): void {
  for (let rowIndex = 0; rowIndex < draft.rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < draft.columnCount; columnIndex++) {
      const cell = draft.cells[rowIndex][columnIndex]
      if (typeof cell.status === 'number' && cell.status !== 0) {
        const flaggedCount = getAroundCount(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && newCell.flagged) ? 1 : 0
          },
        )
        const unknownCount = getAroundCount(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && !newCell.flagged) ? 1 : 0
          },
        )
        const mineCount = cell.status - flaggedCount
        if (mineCount === unknownCount) {
          aroundAction(
            rowIndex,
            columnIndex,
            draft.rowCount,
            draft.columnCount,
            (newRowIndex, newColumnIndex) => flag(draft, newRowIndex, newColumnIndex, true),
          )
        } else if (mineCount === 0) {
          aroundAction(
            rowIndex,
            columnIndex,
            draft.rowCount,
            draft.columnCount,
            (newRowIndex, newColumnIndex) => probe(draft, newRowIndex, newColumnIndex),
          )
        }
      }
    }
  }
}

/**
 * @public
 */
export function checkForEasier(draft: WritableDraft<MineSweeper>): void {
  const conditions: Condition[] = []
  for (let rowIndex = 0; rowIndex < draft.rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < draft.columnCount; columnIndex++) {
      const cell = draft.cells[rowIndex][columnIndex]
      if (typeof cell.status === 'number' && cell.status !== 0) {
        const flaggedPositions = getAroundPositions(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && newCell.flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null
          },
        )
        const unknownPositions = getAroundPositions(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && !newCell.flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null
          },
        )
        const mineCount = cell.status - flaggedPositions.length
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

/**
 * @public
 */
export function checkForNoBrain(draft: WritableDraft<MineSweeper>): void {
  for (let rowIndex = 0; rowIndex < draft.rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < draft.columnCount; columnIndex++) {
      const cell = draft.cells[rowIndex][columnIndex]
      if (!cell.visible && !cell.flagged) {
        cell.possibility = -1
      }
    }
  }

  for (let rowIndex = 0; rowIndex < draft.rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < draft.columnCount; columnIndex++) {
      const cell = draft.cells[rowIndex][columnIndex]
      if (typeof cell.status === 'number' && cell.status !== 0) {
        const flaggedCount = getAroundCount(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && newCell.flagged) ? 1 : 0
          },
        )
        const unknownCount = getAroundCount(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && !newCell.flagged) ? 1 : 0
          },
        )
        const mineCount = cell.status - flaggedCount

        const unknownPositions = getAroundPositions(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => {
            const newCell = draft.cells[newRowIndex][newColumnIndex]
            return (!newCell.visible && !newCell.flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null
          }
        )
        for (const position of unknownPositions) {
          const unknownCell = draft.cells[position.rowIndex][position.columnIndex]
          unknownCell.possibility = Math.max(unknownCell.possibility, Math.round(mineCount * 100.0 / unknownCount))
        }
      }
    }
  }
}

function fail(draft: WritableDraft<MineSweeper>) {
  draft.failed = true
  for (const row of draft.cells) {
    for (const cell of row) {
      cell.showAllMinesWhenGameFailed()
    }
  }
}

/**
 * @public
 */
export function probe(draft: WritableDraft<MineSweeper>, rowIndex: number, columnIndex: number): void {
  const cell = draft.cells[rowIndex][columnIndex]
  cell.probe(draft, rowIndex, columnIndex)
}

function getAroundPositions(
  rowIndex: number,
  columnIndex: number,
  rowCount: number,
  columnCount: number,
  action: (newRowIndex: number, newColumnIndex: number) => Position | null,
) {
  const positions: Position[] = []
  const results = around(rowIndex, columnIndex, rowCount, columnCount, action)
  for (const result of results) {
    if (result !== null) {
      positions.push(result)
    }
  }
  return positions
}

function* aroundIndex<T>(
  rowIndex: number,
  columnIndex: number,
  rowCount: number,
  columnCount: number,
  action: (newRowIndex: number, newColumnIndex: number) => T,
) {
  if (rowIndex >= 0 && rowIndex < rowCount
    && columnIndex >= 0 && columnIndex < columnCount) {
    yield action(rowIndex, columnIndex)
  }
}

function* around<T>(
  rowIndex: number,
  columnIndex: number,
  rowCount: number,
  columnCount: number,
  action: (newRowIndex: number, newColumnIndex: number) => T,
) {
  yield* aroundIndex(rowIndex - 1, columnIndex - 1, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex - 1, columnIndex, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex - 1, columnIndex + 1, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex, columnIndex - 1, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex, columnIndex + 1, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex + 1, columnIndex - 1, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex + 1, columnIndex, rowCount, columnCount, action)
  yield* aroundIndex(rowIndex + 1, columnIndex + 1, rowCount, columnCount, action)
}

function getAroundCount(
  rowIndex: number,
  columnIndex: number,
  rowCount: number,
  columnCount: number,
  action: (newRowIndex: number, newColumnIndex: number) => number,
) {
  let count = 0
  const results = around(rowIndex, columnIndex, rowCount, columnCount, action)
  for (const result of results) {
    count += result
  }
  return count
}

function aroundAction(
  rowIndex: number,
  columnIndex: number,
  rowCount: number,
  columnCount: number,
  action: (newRowIndex: number, newColumnIndex: number) => void
) {
  const results = around(rowIndex, columnIndex, rowCount, columnCount, action)
  while (!results.next().done) {
    // do nothing
  }
}

class Cell {
  [immerable] = true

  constructor(
    private value: number | null = 0 // how many mines around, is mine if is null
  ) { }

  visible = false
  flagged = false
  possibility = -1

  showAllMinesWhenGameFailed() {
    if (this.value === null) {
      this.visible = true
    }
  }
  get status() {
    if (this.visible) {
      return this.value
    }
    if (this.flagged) {
      return true
    }
    return 'unknown'
  }
  probe(
    draft: WritableDraft<MineSweeper>,
    rowIndex: number,
    columnIndex: number,
  ) {
    if (this.visible || this.flagged) {
      return
    }
    if (this.value === null) {
      fail(draft)
    } else {
      this.visible = true
      if (this.status === 0) {
        aroundAction(
          rowIndex,
          columnIndex,
          draft.rowCount,
          draft.columnCount,
          (newRowIndex, newColumnIndex) => probe(draft, newRowIndex, newColumnIndex),
        )
      }
    }
  }
}

interface Position {
  rowIndex: number;
  columnIndex: number;
}

interface Condition {
  positions: Position[];
  mineCount: number;
}
