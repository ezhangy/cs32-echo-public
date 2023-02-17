import { isModeVerbose, loadedCSV, mockLoadMap } from "../../main.js";
import { numberCSVSearchMap, stringCSVSearchMap } from "../../mockedJson.js";
import { Result } from "../../ResultCreator.js";
import { CSV } from "../csv/CSV.types.js";
import { TableCreator } from "../csv/CSVCreators.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
import { Command } from "./Command.types";

export class Search implements Command<string | CSV> {
  searchHelper(column: string, searchTerm: string): CSV | null {
    const stringTerm = JSON.stringify([column, searchTerm]);
    if (loadedCSV === mockLoadMap["numberCSV.csv"]) {
      return stringTerm in numberCSVSearchMap
        ? numberCSVSearchMap[stringTerm]
        : [];
    } else if (loadedCSV === mockLoadMap["stringCSV.csv"]) {
      return stringTerm in stringCSVSearchMap
        ? stringCSVSearchMap[stringTerm]
        : [];
    } else if (loadedCSV.length === 0) {
      return [];
    } else {
      return null;
    }
  }

  run(args: string[], commandText: string): Result<string | CSV> {
    let toReturn: string | CSV;

    if (args.length == 3) {
      const searchResult = this.searchHelper(args[1], args[2]);
      if (searchResult == null) {
        toReturn = `No CSV file loaded.`;
      } else if (searchResult.length === 0) {
        toReturn = `No search results found.`;
      } else {
        toReturn = searchResult;
      }
    } else {
      toReturn = `Exception: view expected 0 arguments but found ${
        args.length - 1
      }.`;
    }

    return {
      command: commandText,
      outputCreator: typeof toReturn === "string" 
        ? new ParagraphEltCreator()
        : new TableCreator(),
      output: toReturn,
      isResultVerbose: isModeVerbose
    };
  }
}
