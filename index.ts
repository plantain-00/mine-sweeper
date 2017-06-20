import Vue from "vue";
import Component from "vue-class-component";
import { indexTemplateHtml } from "./variables";

type Cell = {
    value: number | null; // how many mines around, is mine if is null
    visible: boolean;
    flagged: boolean;
};

@Component({
    template: indexTemplateHtml,
})
class App extends Vue {
    rowCount = 16;
    columnCount = 30;
    mineCount = 99;

    cells: Cell[][] = [];

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
        this.initCells();
    }

    initCells() {
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
        while (mineCount >= 0) {
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
    }

    getMineCountAround(rowIndex: number, columnIndex: number) {
        return (rowIndex >= 0 && rowIndex < this.rowCount
            && columnIndex >= 0 && columnIndex <= this.columnCount
            && this.cells[rowIndex][columnIndex].value === null) ? 1 : 0;
    }

    probe(rowIndex: number, columnIndex: number) {
        const cell = this.cells[rowIndex][columnIndex];
        if (cell.value === null) {
            // lose the game
        } else {
            cell.value = this.getMineCountAround(rowIndex - 1, columnIndex - 1)
                + this.getMineCountAround(rowIndex - 1, columnIndex)
                + this.getMineCountAround(rowIndex - 1, columnIndex + 1)
                + this.getMineCountAround(rowIndex, columnIndex - 1)
                + this.getMineCountAround(rowIndex, columnIndex + 1)
                + this.getMineCountAround(rowIndex + 1, columnIndex - 1)
                + this.getMineCountAround(rowIndex + 1, columnIndex)
                + this.getMineCountAround(rowIndex + 1, columnIndex + 1);
            cell.visible = true;
        }
    }

    flag(e: Event, rowIndex: number, columnIndex: number) {
        const cell = this.cells[rowIndex][columnIndex];
        if (!cell.visible) {
            cell.flagged = !cell.flagged;
        }
        e.preventDefault();
        return false;
    }
}

// tslint:disable-next-line:no-unused-expression
new App({ el: "#container" });

if (navigator.serviceWorker) {
    navigator.serviceWorker.register("service-worker.bundle.js").catch(error => {
        // tslint:disable-next-line:no-console
        console.log("registration failed with error: " + error);
    });
}
