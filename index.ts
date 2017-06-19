import Vue from "vue";
import Component from "vue-class-component";
import { indexTemplateHtml } from "./variables";

type Cell = {
    rowIndex: number;
    columnIndex: number;
};

@Component({
    template: indexTemplateHtml,
})
class App extends Vue {
    rowCount = 16;
    columnCount = 30;

    cells: Cell[] = [];

    get mainStyle() {
        return {
            height: this.rowCount * 30 + "px",
            width: this.columnCount * 30 + "px",
        };
    }

    beforeMount() {
        this.initCells();
    }

    initCells() {
        const cells: Cell[] = [];
        for (let i = 0; i < this.rowCount; i++) {
            for (let j = 0; j < this.columnCount; j++) {
                cells.push({
                    rowIndex: i,
                    columnIndex: j,
                });
            }
        }
        this.cells = cells;
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
