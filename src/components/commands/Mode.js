import { toggleVerbosity, isModeVerbose } from "../../main.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class Mode {
    run(args, commandText) {
        toggleVerbosity();
        let output = `mode changed to ${isModeVerbose ? "verbose" : "brief"}`;
        return {
            command: commandText,
            outputCreator: new ParagraphEltCreator(),
            output: output,
            isResultVerbose: isModeVerbose
        };
    }
}
