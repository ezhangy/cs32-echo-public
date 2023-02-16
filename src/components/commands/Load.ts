import { isModeVerbose, setLoadedCSV } from "../../main.js";
import { mockLoadMap } from "../../mockedJson.js";
import { CSV } from "../csv/CSV.types";
import { CommandLog, CommandOutputType } from "../log/Log.types";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
import { Command } from "./Command.types";



export class Load implements Command {
  public loadHelper(filePath: string): boolean {
    if (filePath in mockLoadMap) {
      setLoadedCSV(mockLoadMap[filePath])
      return true;
    } else {
      return false;
    }
  }
  
  run(args: Array<string>): CommandLog<CommandOutputType> {
    let output = `Exception: load_file expected 1 argument but found ${
      args.length - 1
    }.`;
    if (args.length == 2) {
      if (this.loadHelper(args[1])) {
        output = `Successfully loaded ${args[1]}.`;
      } else {
        output = `Could not find ${args[1]}.`;
      }
    }
  
    return {
      command: "load_file",
      outputCreator: new ParagraphEltCreator(),
      output: output,
      inVerboseMode: isModeVerbose,
    };
  }
}