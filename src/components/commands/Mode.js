import { setVerbosity, getIsModeVerbose } from "../../main.js";
import { ParagraphEltCreator } from "../creators/ParagraphEltCreator.js";
export class Mode {
    run(args, commandText) {
        setVerbosity(!getIsModeVerbose());
        let output = `mode changed to ${getIsModeVerbose() ? "verbose" : "brief"}`;
        return {
            command: commandText,
            outputCreator: new ParagraphEltCreator(),
            output: output,
            isResultVerbose: getIsModeVerbose()
        };
    }
}
