import { HTMLCreator } from "../HTMLCreator.types";
import { CSV, CSVRow } from "./CSV.types";

export class CSVRowCreator implements HTMLCreator<CSVRow> {
  private makeCellHTML(cell: string | number): string {
    let cellStr = typeof cell === "number" 
      ? cell.toString()
      : cell
    return `<td>${cellStr}</td>`;
  }

  makeInnerHTML(javascriptObj: CSVRow): string {
    return `<tr>${javascriptObj
      .map((cell) => this.makeCellHTML(cell))
      .join("\n")}</tr>`;
  }
}

export class TableCreator implements HTMLCreator<CSV> {
  makeInnerHTML(javascriptObj: CSV): string {
     return `<table>${javascriptObj
      .map((row) => (new CSVRowCreator().makeInnerHTML(row)))
      .join("\n")}</table>`;
  }
}