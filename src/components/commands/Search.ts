import { isModeVerbose } from "../../main";
import { CommandLog, CommandOutputType } from "../log/Log.types";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator";
import { Command } from "./Command.types";


export class Search implements Command {
  run(args: string[]): CommandLog<CommandOutputType> {
    const log: CommandLog<string> = {
      command: "search",
      outputCreator: new ParagraphEltCreator(),
      output: `search command executed with args: ${args}`,
      inVerboseMode: isModeVerbose,
    };
    return log
  }
}