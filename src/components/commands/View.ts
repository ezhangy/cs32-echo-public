import { loadedCSV, isModeVerbose } from "../../main.js";
import { CSV } from "../csv/CSV.types";
import { TableCreator } from "../csv/CSVCreators.js";
import { HTMLableObject } from "../HTMLableObject.js";
import { CommandLog, CommandOutputType } from "../log/Log.types";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
import { Command } from "./Command.types";


export class View implements Command {
  public viewHelper(): CSV | null {
    if (loadedCSV == undefined) {
      return null;
    } else {
      return loadedCSV;
    }
  }

  run(args: string[]): CommandLog<CommandOutputType> {
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
      command: "view",
      outputCreator: 
        typeof toReturn === "string"
          ? new ParagraphEltCreator()
          : new TableCreator(),
      output: toReturn,
      inVerboseMode: isModeVerbose,
    }
  }
}