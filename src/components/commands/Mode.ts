import { toggleVerbosity, isModeVerbose } from "../../main";
import { CommandLog, CommandOutputType } from "../log/Log.types";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator";
import { Command } from "./Command.types";


export class Mode implements Command {
  run(args: string[]): CommandLog<CommandOutputType> {
    toggleVerbosity();
    let output = `mode changed to ${isModeVerbose ? "verbose" : "brief"}`;
    const log: CommandLog<string> = {
    command: "mode",
    outputCreator: new ParagraphEltCreator(),
    output: output,
    inVerboseMode: isModeVerbose,
  };
  return log;
  }
}