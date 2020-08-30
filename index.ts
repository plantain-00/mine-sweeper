import Vue from 'vue'
import Component from 'vue-class-component'
import { indexTemplateHtml, indexTemplateHtmlStatic } from './variables'

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

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
  rowCount = 16
  columnCount = 30
  mineCount = 99

  cells: Cell[][] = []
  remainMineCount = 0
  remainUnknownCount = 0
  difficulty = Difficulty.normal
  private failed = false

  get mainStyle() {
    return {
      height: this.rowCount * 30 + 'px',
      width: this.columnCount * 30 + 'px'
    }
  }

  private get cellsCount() {
    return this.rowCount * this.columnCount
  }

  get averagePossibility() {
    return Math.round(this.remainMineCount * 100.0 / this.remainUnknownCount)
  }

  beforeMount() {
    this.start()

    setInterval(() => {
      if (this.remainUnknownCount > 0 && !this.failed) {
        if (this.difficulty >= Difficulty.easy) {
          this.checkForEasy()
        }
        if (this.difficulty >= Difficulty.easier) {
          this.checkForEasier()
        }
        if (this.difficulty >= Difficulty.noBrain) {
          this.checkForNoBrain()
        }
      }
    }, 1000)
  }

  start() {
    const cells: Cell[][] = []
    for (let i = 0; i < this.rowCount; i++) {
      cells.push([])
      for (let j = 0; j < this.columnCount; j++) {
        cells[i].push({
          value: 0,
          visible: false,
          flagged: false,
          possibility: -1
        })
      }
    }

    let mineCount = this.mineCount
    while (mineCount > 0) {
      const index = Math.floor(Math.random() * this.cellsCount)
      const columnIndex = Math.floor(index / this.columnCount)
      const rowIndex = index - columnIndex * this.columnCount
      const cell = cells[columnIndex][rowIndex]
      if (cell.value !== null) {
        cell.value = null
        mineCount--
      }
    }

    this.cells = cells
    this.remainMineCount = this.mineCount
    this.remainUnknownCount = this.cellsCount
    this.failed = false
  }

  click(rowIndex: number, columnIndex: number) {
    this.probe(rowIndex, columnIndex)
  }

  contextmenu(e: Event, rowIndex: number, columnIndex: number, flagged: boolean) {
    this.flag(rowIndex, columnIndex, flagged)
    e.preventDefault()
    return false
  }

  private flag(rowIndex: number, columnIndex: number, flagged: boolean) {
    const cell = this.cells[rowIndex][columnIndex]
    if (!cell.visible) {
      if (flagged) {
        if (!cell.flagged) {
          cell.flagged = true
          this.remainMineCount--
          this.remainUnknownCount--
        }
      } else {
        if (cell.flagged) {
          cell.flagged = false
          this.remainMineCount++
          this.remainUnknownCount++
        }
      }
    }
  }

  private probe(rowIndex: number, columnIndex: number) {
    const cell = this.cells[rowIndex][columnIndex]
    if (!cell.visible && !cell.flagged) {
      if (cell.value === null) {
        this.fail()
      } else {
        cell.value = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.cells[newRowIndex][newColumnIndex].value === null ? 1 : 0)
        cell.visible = true
        this.remainUnknownCount--

        this.checkForNormal(cell, rowIndex, columnIndex)
      }
    }
  }

  private fail() {
    this.failed = true
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.value === null) {
          cell.visible = true
        }
      }
    }
  }

  private getAroundCount(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => number): number {
    let count = 0
    const results = this.around(rowIndex, columnIndex, action)
    for (const result of results) {
      count += result
    }
    return count
  }

  private aroundAction(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => void): void {
    const results = this.around(rowIndex, columnIndex, action)
    while (!results.next().done) {
      // do nothing
    }
  }

  private getAroundPositions(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => Position | null): Position[] {
    const positions: Position[] = []
    const results = this.around(rowIndex, columnIndex, action)
    for (const result of results) {
      if (result !== null) {
        positions.push(result)
      }
    }
    return positions
  }

  private *aroundIndex<T>(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => T) {
    if (rowIndex >= 0 && rowIndex < this.rowCount
      && columnIndex >= 0 && columnIndex < this.columnCount) {
      yield action(rowIndex, columnIndex)
    }
  }

  private *around<T>(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => T) {
    yield* this.aroundIndex(rowIndex - 1, columnIndex - 1, action)
    yield* this.aroundIndex(rowIndex - 1, columnIndex, action)
    yield* this.aroundIndex(rowIndex - 1, columnIndex + 1, action)
    yield* this.aroundIndex(rowIndex, columnIndex - 1, action)
    yield* this.aroundIndex(rowIndex, columnIndex + 1, action)
    yield* this.aroundIndex(rowIndex + 1, columnIndex - 1, action)
    yield* this.aroundIndex(rowIndex + 1, columnIndex, action)
    yield* this.aroundIndex(rowIndex + 1, columnIndex + 1, action)
  }

  private checkForNormal(cell: Cell, rowIndex: number, columnIndex: number) {
    if (cell.value === 0) {
      this.aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.probe(newRowIndex, newColumnIndex))
    }
  }

  private checkForEasy() {
    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        const cell = this.cells[rowIndex][columnIndex]
        if (cell.visible && cell.value !== null && cell.value !== 0) { // only check its value if it is visible, or it is cheat
          const flaggedCount = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && this.cells[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const unknownCount = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && !this.cells[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const mineCount = cell.value - flaggedCount
          if (mineCount === unknownCount) {
            this.aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.flag(newRowIndex, newColumnIndex, true))
          } else if (mineCount === 0) {
            this.aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.probe(newRowIndex, newColumnIndex))
          }
        }
      }
    }
  }

  private checkForEasier() {
    const conditions: Condition[] = []
    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        const cell = this.cells[rowIndex][columnIndex]
        if (cell.visible && cell.value !== null && cell.value !== 0) { // only check its value if it is visible, or it is cheat
          const flaggedPositions = this.getAroundPositions(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && this.cells[newRowIndex][newColumnIndex].flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null)
          const unknownPositions = this.getAroundPositions(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && !this.cells[newRowIndex][newColumnIndex].flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null)
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
              this.flag(position.rowIndex, position.columnIndex, true)
            }
          } else if (mineCount === 0) {
            const positions = condition1.positions.filter(p1 => condition2.positions.every(p2 => p1.rowIndex !== p2.rowIndex || p1.columnIndex !== p2.columnIndex))
            for (const position of positions) {
              this.probe(position.rowIndex, position.columnIndex)
            }
          }
        }
      }
    }
  }

  private checkForNoBrain() {
    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        const cell = this.cells[rowIndex][columnIndex]
        if (!cell.visible && !cell.flagged) {
          cell.possibility = -1
        }
      }
    }

    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        const cell = this.cells[rowIndex][columnIndex]
        if (cell.visible && cell.value !== null && cell.value !== 0) { // only check its value if it is visible, or it is cheat
          const flaggedCount = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && this.cells[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const unknownCount = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && !this.cells[newRowIndex][newColumnIndex].flagged) ? 1 : 0)
          const mineCount = cell.value - flaggedCount

          const unknownPositions = this.getAroundPositions(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => (!this.cells[newRowIndex][newColumnIndex].visible && !this.cells[newRowIndex][newColumnIndex].flagged) ? { rowIndex: newRowIndex, columnIndex: newColumnIndex } : null)
          for (const position of unknownPositions) {
            const unknownCell = this.cells[position.rowIndex][position.columnIndex]
            unknownCell.possibility = Math.max(unknownCell.possibility, Math.round(mineCount * 100.0 / unknownCount))
          }
        }
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

new App({ el: '#container' })

if (navigator.serviceWorker && !location.host.startsWith('localhost')) {
  navigator.serviceWorker.register('service-worker.bundle.js').catch((error: Error) => {
    console.log('registration failed with error: ' + error)
  })
}
