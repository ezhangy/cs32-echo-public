import { toggleVerbosity, getIsModeVerbose } from "../../main.js";
import { Result } from "../../ResultCreator.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
import { Command } from "./Command.types";


export class Mode implements Command<string> {
  run(args: Array<string>, commandText: string): Result<string> {
    toggleVerbosity();
    let output = `mode changed to ${getIsModeVerbose() ? "verbose" : "brief"}`;
    
    return  {
    command: commandText,
    outputCreator: new ParagraphEltCreator(),
    output: output,
    isResultVerbose: getIsModeVerbose()
  };
  }
}