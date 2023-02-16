import { isModeVerbose } from "../../main.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class Search {
    run(args) {
        const log = {
            command: "search",
            outputCreator: new ParagraphEltCreator(),
            output: `search command executed with args: ${args}`,
            inVerboseMode: isModeVerbose,
        };
        return log;
    }
}
