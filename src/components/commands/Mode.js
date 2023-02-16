import { toggleVerbosity, isModeVerbose } from "../../main.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class Mode {
    run(args) {
        toggleVerbosity();
        let output = `mode changed to ${isModeVerbose ? "verbose" : "brief"}`;
        const log = {
            command: "mode",
            outputCreator: new ParagraphEltCreator(),
            output: output,
            inVerboseMode: isModeVerbose,
        };
        return log;
    }
}
