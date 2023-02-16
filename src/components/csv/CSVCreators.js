export class CSVRowCreator {
    makeCellHTML(cell) {
        let cellStr = typeof cell === "number"
            ? cell.toString()
            : cell;
        return `<td>${cellStr}</td>`;
    }
    makeInnerHTML(javascriptObj) {
        return `<tr>${javascriptObj
            .map((cell) => this.makeCellHTML(cell))
            .join("\n")}</tr>`;
    }
}
export class TableCreator {
    makeInnerHTML(javascriptObj) {
        return `<table>${javascriptObj
            .map((row) => (new CSVRowCreator().makeInnerHTML(row)))
            .join("\n")}</table>`;
    }
}
