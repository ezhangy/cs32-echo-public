import { loadedCSV, isModeVerbose } from "../../main";
import { CSV } from "../csv/CSV.types";
import { TableCreator } from "../csv/CSVCreators";
import { CommandLog, CommandOutputType } from "../log/Log.types";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator";
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
    let output:
    | string
    | Array<
        Array<string | number>
      > = `Exception: view expected 0 arguments but found ${args.length - 1}.`;
  if (args.length == 1) {
    if (this.viewHelper() != null) {
      console.log(`loadedCSV is ${JSON.stringify(loadedCSV)}`)
    } else {
      output = `No CSV file loaded.`;
    }
  }

  const log: CommandLog<CommandOutputType> = {
    command: "view",
    outputCreator: typeof output === "string"
      ? new ParagraphEltCreator
      : new TableCreator,
    output: output,
    inVerboseMode: isModeVerbose,
  }

  return log
  }
}