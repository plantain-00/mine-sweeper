import Vue from "vue";
import Component from "vue-class-component";
import { indexTemplateHtml } from "./variables";

type Cell = {
    value: number | null; // how many mines around, is mine if is null
    visible: boolean;
    flagged: boolean;
};

const enum Difficulty {
    normal = 0,
    easy = 1,
}

@Component({
    template: indexTemplateHtml,
})
class App extends Vue {
    rowCount = 16;
    columnCount = 30;
    mineCount = 99;

    cells: Cell[][] = [];
    remainMineCount = 0;
    remainUnknownCount = 0;
    failed = false;
    difficulty = Difficulty.normal;

    get mainStyle() {
        return {
            height: this.rowCount * 30 + "px",
            width: this.columnCount * 30 + "px",
        };
    }

    get cellsCount() {
        return this.rowCount * this.columnCount;
    }

    beforeMount() {
        this.start();

        setInterval(() => {
            if (this.remainUnknownCount > 0 && this.difficulty >= Difficulty.easy) {
                this.checkForEasy();
            }
        }, 1000);
    }

    start() {
        const cells: Cell[][] = [];
        for (let i = 0; i < this.rowCount; i++) {
            cells.push([]);
            for (let j = 0; j < this.columnCount; j++) {
                cells[i].push({
                    value: 0,
                    visible: false,
                    flagged: false,
                });
            }
        }

        let mineCount = this.mineCount;
        while (mineCount > 0) {
            const index = Math.floor(Math.random() * this.cellsCount);
            const columnIndex = Math.floor(index / this.columnCount);
            const rowIndex = index - columnIndex * this.columnCount;
            const cell = cells[columnIndex][rowIndex];
            if (cell.value !== null) {
                cell.value = null;
                mineCount--;
            }
        }

        this.cells = cells;
        this.remainMineCount = this.mineCount;
        this.remainUnknownCount = this.cellsCount;
        this.failed = false;
    }

    getMineCountAround(rowIndex: number, columnIndex: number) {
        return this.cells[rowIndex][columnIndex].value === null ? 1 : 0;
    }

    getFlaggedCountAround(rowIndex: number, columnIndex: number) {
        return (!this.cells[rowIndex][columnIndex].visible && this.cells[rowIndex][columnIndex].flagged) ? 1 : 0;
    }

    getUnknownCountAround(rowIndex: number, columnIndex: number) {
        return (!this.cells[rowIndex][columnIndex].visible && !this.cells[rowIndex][columnIndex].flagged) ? 1 : 0;
    }

    isValidIndex(rowIndex: number, columnIndex: number) {
        return rowIndex >= 0 && rowIndex < this.rowCount
            && columnIndex >= 0 && columnIndex < this.columnCount;
    }

    click(rowIndex: number, columnIndex: number) {
        this.probe(rowIndex, columnIndex);
    }

    probe(rowIndex: number, columnIndex: number) {
        const cell = this.cells[rowIndex][columnIndex];
        if (!cell.visible && !cell.flagged) {
            if (cell.value === null) {
                this.fail();
            } else {
                cell.value = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.getMineCountAround(newRowIndex, newColumnIndex));
                cell.visible = true;
                this.remainUnknownCount--;

                this.checkForNormal(cell, rowIndex, columnIndex);
            }
        }
    }

    contextmenu(e: Event, rowIndex: number, columnIndex: number, flagged: boolean) {
        this.flag(rowIndex, columnIndex, flagged);
        e.preventDefault();
        return false;
    }

    flag(rowIndex: number, columnIndex: number, flagged: boolean) {
        const cell = this.cells[rowIndex][columnIndex];
        if (!cell.visible) {
            if (flagged) {
                if (!cell.flagged) {
                    cell.flagged = true;
                    this.remainMineCount--;
                    this.remainUnknownCount--;
                }
            } else {
                if (cell.flagged) {
                    cell.flagged = false;
                    this.remainMineCount++;
                    this.remainUnknownCount++;
                }
            }
        }
    }

    fail() {
        this.failed = true;
        for (const row of this.cells) {
            for (const cell of row) {
                if (cell.value === null) {
                    cell.visible = true;
                }
            }
        }
    }

    getAroundCount(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => number): number {
        let count = 0;
        const results = this.around(rowIndex, columnIndex, action);
        for (const result of results) {
            count += result;
        }
        return count;
    }

    aroundAction(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => void): void {
        const results = this.around(rowIndex, columnIndex, action);
        while (!results.next().done) {
            // do nothing
        }
    }

    *aroundIndex<T>(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => T) {
        if (this.isValidIndex(rowIndex, columnIndex)) {
            yield action(rowIndex, columnIndex);
        }
    }

    *around<T>(rowIndex: number, columnIndex: number, action: (newRowIndex: number, newColumnIndex: number) => T) {
        yield* this.aroundIndex(rowIndex - 1, columnIndex - 1, action);
        yield* this.aroundIndex(rowIndex - 1, columnIndex, action);
        yield* this.aroundIndex(rowIndex - 1, columnIndex + 1, action);
        yield* this.aroundIndex(rowIndex, columnIndex - 1, action);
        yield* this.aroundIndex(rowIndex, columnIndex + 1, action);
        yield* this.aroundIndex(rowIndex + 1, columnIndex - 1, action);
        yield* this.aroundIndex(rowIndex + 1, columnIndex, action);
        yield* this.aroundIndex(rowIndex + 1, columnIndex + 1, action);
    }

    checkForNormal(cell: Cell, rowIndex: number, columnIndex: number) {
        if (cell.value === 0) {
            this.aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.probe(newRowIndex, newColumnIndex));
        }
    }

    checkForEasy() {
        for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
                const cell = this.cells[rowIndex][columnIndex];
                if (cell.visible) { // only check its value if it is visible, or it is cheat
                    if (cell.value !== null && cell.value !== 0) {
                        const flaggedCount = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.getFlaggedCountAround(newRowIndex, newColumnIndex));
                        const unknownCount = this.getAroundCount(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.getUnknownCountAround(newRowIndex, newColumnIndex));
                        if (flaggedCount + unknownCount === cell.value) {
                            this.aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.flag(newRowIndex, newColumnIndex, true));
                        } else if (flaggedCount === cell.value) {
                            this.aroundAction(rowIndex, columnIndex, (newRowIndex, newColumnIndex) => this.probe(newRowIndex, newColumnIndex));
                        }
                    }
                }
            }
        }
    }

    // checkForEasier() {

    // }
}

// tslint:disable-next-line:no-unused-expression
new App({ el: "#container" });

if (navigator.serviceWorker) {
    navigator.serviceWorker.register("service-worker.bundle.js").catch(error => {
        // tslint:disable-next-line:no-console
        console.log("registration failed with error: " + error);
    });
}
