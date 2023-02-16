import { loadedCSV, isModeVerbose } from "../../main.js";
import { TableCreator } from "../csv/CSVCreators.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class View {
    viewHelper() {
        if (loadedCSV == undefined) {
            return null;
        }
        else {
            return loadedCSV;
        }
    }
    run(args) {
        let toReturn = `Exception: view expected 0 arguments but found ${args.length - 1}.`;
        if (args.length == 1) {
            if (this.viewHelper() != null) {
                toReturn = loadedCSV;
            }
            else {
                toReturn = `No CSV file loaded.`;
            }
        }
        return {
            command: "view",
            outputCreator: typeof toReturn === "string"
                ? new ParagraphEltCreator()
                : new TableCreator(),
            output: toReturn,
            inVerboseMode: isModeVerbose,
        };
    }
}
