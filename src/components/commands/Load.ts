import { isModeVerbose } from "../../main";
import { mockLoadMap } from "../../mockedJson";
import { CSV } from "../csv/CSV.types";
import { CommandLog, CommandOutputType } from "../log/Log.types";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator";
import { Command } from "./Command.types";



export class Load implements Command {
  public loadHelper(filePath: string): CSV | null {
    if (filePath in mockLoadMap) {
      return mockLoadMap[filePath];
    } else {
      return null;
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
  };
}

