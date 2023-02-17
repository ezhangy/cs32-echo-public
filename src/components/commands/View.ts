import { loadedCSV, getIsModeVerbose } from "../../main.js";
import { Result } from "../../ResultCreator.js";
import { CSV } from "../csv/CSV.types";
import { TableCreator } from "../csv/CSVCreators.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
import { Command } from "./Command.types";


export class View implements Command<string | CSV> {
  public viewHelper(): CSV | null {
    if (loadedCSV == undefined) {
      return null;
    } else {
      return loadedCSV;
    }
  }

  run(args: string[], commandText: string): Result<string | CSV> {
    let toReturn: string | CSV;
    if (args.length == 1) {
      if (this.viewHelper() != null) {
        toReturn = loadedCSV;
      } else {
        toReturn = `No CSV file loaded.`;
      } 
    } else {
      toReturn = `Exception: view expected 0 arguments but found ${args.length - 1}.`
    }

    return {
      command: commandText,
      outputCreator: typeof toReturn === "string" 
        ? new ParagraphEltCreator()
        : new TableCreator(),
      output: toReturn,
      isResultVerbose: getIsModeVerbose()
    };
  }
}