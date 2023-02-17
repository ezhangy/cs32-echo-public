import { isModeVerbose, setLoadedCSV } from "../../main.js";
import { mockLoadMap } from "../../mockedJson.js";
import { ParagraphEltCreator } from "../utilityCreators/ParagraphEltCreator.js";
export class Load {
    loadHelper(filePath) {
        if (filePath in mockLoadMap) {
            setLoadedCSV(mockLoadMap[filePath]);
            return true;
        }
        else {
            return false;
        }
    }
    run(args, commandText) {
        let output = `Exception: load_file expected 1 argument but found ${args.length - 1}.`;
        if (args.length == 2) {
            if (this.loadHelper(args[1])) {
                output = `Successfully loaded ${args[1]}.`;
            }
            else {
                output = `Could not find ${args[1]}.`;
            }
        }
        return {
            command: commandText,
            outputCreator: new ParagraphEltCreator(),
            output: output,
            isResultVerbose: isModeVerbose
        };
    }
}
