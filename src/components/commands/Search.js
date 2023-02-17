import { isModeVerbose, loadedCSV, mockLoadMap } from "../../main.js";
import { numberCSVSearchMap, stringCSVSearchMap } from "../../mockedJson.js";
import { TableCreator } from "../csv/CSVCreators.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class Search {
    searchHelper(column, searchTerm) {
        const stringTerm = JSON.stringify([column, searchTerm]);
        if (loadedCSV === mockLoadMap["numberCSV.csv"]) {
            return stringTerm in numberCSVSearchMap
                ? numberCSVSearchMap[stringTerm]
                : [];
        }
        else if (loadedCSV === mockLoadMap["stringCSV.csv"]) {
            return stringTerm in stringCSVSearchMap
                ? stringCSVSearchMap[stringTerm]
                : [];
        }
        else if (loadedCSV.length === 0) {
            return [];
        }
        else {
            return null;
        }
    }
    run(args) {
        let toReturn;
        if (args.length == 3) {
            const searchResult = this.searchHelper(args[1], args[2]);
            if (searchResult == null) {
                toReturn = `No CSV file loaded.`;
            }
            else if (searchResult.length === 0) {
                toReturn = `No search results found.`;
            }
            else {
                toReturn = searchResult;
            }
        }
        else {
            toReturn = `Exception: view expected 0 arguments but found ${args.length - 1}.`;
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
