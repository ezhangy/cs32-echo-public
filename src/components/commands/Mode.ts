import { setVerbosity, getIsModeVerbose } from "../../main.js";
import { Result } from "../creators/ResultCreator";
import { ParagraphEltCreator } from "../creators/ParagraphEltCreator.js";
import { Command } from "./Command.types";


export class Mode implements Command<string> {
  run(args: Array<string>, commandText: string): Result<string> {
    setVerbosity(!getIsModeVerbose())
    let output = `mode changed to ${getIsModeVerbose() ? "verbose" : "brief"}`;
    
    return  {
    command: commandText,
    outputCreator: new ParagraphEltCreator(),
    output: output,
    isResultVerbose: getIsModeVerbose()
  };
  }
}