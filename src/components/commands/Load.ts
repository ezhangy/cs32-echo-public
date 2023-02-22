import { getIsModeVerbose, setLoadedCSV } from "../../main.js";
import { mockLoadMap } from "../../mockedJson.js";
import { Result } from "../creators/ResultCreator";
import { ParagraphEltCreator } from "../creators/ParagraphEltCreator.js";
import { Command } from "./Command.types";



export class Load implements Command<string> {
  public loadHelper(filePath: string): boolean {
    if (filePath in mockLoadMap) {
      setLoadedCSV(mockLoadMap[filePath])
      return true;
    } else {
      return false;
    }
  }
  
  run(args: Array<string>, commandText: string): Result<string> {
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
      command: commandText,
      outputCreator: new ParagraphEltCreator(),
      output: output,
      isResultVerbose: getIsModeVerbose()
    };
  }
}