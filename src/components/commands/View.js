import { loadedCSV, getIsModeVerbose } from "../../main.js";
import { TableCreator } from "../csv/CSVCreators.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class View {
    viewHelper() {
        if (loadedCSV == undefined || loadedCSV == null) {
            return null;
        }
        else {
            return loadedCSV;
        }
    }
    run(args, commandText) {
        let toReturn;
        if (args.length == 1) {
            if (loadedCSV != null && this.viewHelper() != null) {
                toReturn = loadedCSV;
            }
            else {
                toReturn = `No CSV file loaded.`;
            }
        }
        else {
            toReturn = `Exception: view expected 0 arguments but found ${args.length - 1}.`;
        }
        return {
            command: commandText,
            outputCreator: typeof toReturn === "string"
                ? new ParagraphEltCreator()
                : new TableCreator(),
            output: toReturn,
            isResultVerbose: getIsModeVerbose(),
        };
    }
}
