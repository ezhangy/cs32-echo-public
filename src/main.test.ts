// all exports from main will now be available as main.X
import * as main from "./main";

// Lets us use DTL's query library
// Lets us send user events (like typing and clicking)
import { Command, View } from "./components/commands/allcommands.js";
import { Mode } from "./components/commands/Mode";
import { Load } from "./components/commands/Load";
import { Search } from "./components/commands/Search";
import { CSV } from "./components/csv/CSV.types";
import { Result } from "./components/creators/ResultCreator";
import { HTMLCreator } from "./components/creators/HTMLCreator.types";


class MockCreator implements HTMLCreator<string> {
  makeInnerHTML(javascriptObj: string): string {
    return `<div>${javascriptObj}</div>`;
  }
}

class MockCommand implements Command<string> {
  run(args: string[], commandText: string): Result<string> {
    return {
      command: commandText,
      outputCreator: new MockCreator(),
      output: `args passed into the mock command: ${args.join(", ")}`,
      isResultVerbose: main.getIsModeVerbose(),
    };
  }
}

let mockArgs: Array<string>;
let mockCommandText: string;
let mockCommandOutput: string;
let mockCommandMap: { [commandName: string]: Command<any> }

beforeEach(function () {
  main.clearHistory();
  main.resetMode();
  main.resetLoadedCSV();
  mockCommandText = "mock arg0 arg1 arg2";
  mockArgs = ["mock", "arg0", "arg1", "arg2"];
  mockCommandOutput = "args passed into the mock command: mock, arg0, arg1, arg2"
  mockCommandMap = {
    mock: new MockCommand()
  }
})

test("running command updates history state", () => {
  expect(main.getHistory().length).toBe(0)
  main.pushHistoryElt(mockCommandMap, "mock 1")
  main.pushHistoryElt(mockCommandMap, "mock 2")
  main.pushHistoryElt(mockCommandMap, "mock 3")
  
  const history = main.getHistory()

  expect(history[0].output).toBe("args passed into the mock command: mock, 1")
  expect(history[1].output).toBe("args passed into the mock command: mock, 2")
  expect(history[2].output).toBe("args passed into the mock command: mock, 3")
})

// mode history
test("application starts in brief mode", () => {
  expect(main.getIsModeVerbose()).toBe(false);
});

test("setVerbosity changes mode state", () => {
  main.setVerbosity(true);
  expect(main.getIsModeVerbose()).toBe(true);
  main.setVerbosity(false);
  expect(main.getIsModeVerbose()).toBe(false);
});

test("modeCommand changes mode state", () => {
  new Mode().run(["mode"], "mode");
  expect(main.getIsModeVerbose()).toBe(true);

  new Mode().run(["mode"], "mode");
  expect(main.getIsModeVerbose()).toBe(false);
});

//testing load_file command (switching datasets)
test("loadedCSV is updated, output is present", function () {
  const toNewCSVResult: Result<string> = new Load().run(
    ["load", "stringCSV.csv"],
    "load"
  );
  expect(toNewCSVResult.command).toBe("load");
  expect(toNewCSVResult.output).toBe("Successfully loaded stringCSV.csv.");
  expect(main.loadedCSV).toStrictEqual([
    ["tim", "nelson", "instructor"],
    ["john", "doe", "student"],
    ["jane", "doe", "student"],
  ]);
});

test("if filepath is invalid, error is present", function () {
  const toNewCSVResult: Result<string> = new Load().run(
    ["load", "test.csv"],
    "load"
  );
  expect(toNewCSVResult.command).toBe("load");
  expect(toNewCSVResult.output).toBe("Could not find test.csv.");
});

test("if incorrect number of args is provided, error is present", function () {
  const toNewCSVResult: Result<string> = new Load().run(
    ["load", "stringCSV.csv", "test"],
    "load"
  );
  expect(toNewCSVResult.command).toBe("load");
  expect(toNewCSVResult.output).toBe(
    "Exception: load_file expected 1 argument but found 2."
  );
});


//testing view command
test("check correct output table", function () {
  new Load().run(["load", "stringCSV.csv"], "load");
  const toNewViewResult: Result<string | CSV> = new View().run(
    ["view"],
    "view"
  );
  expect(toNewViewResult.command).toBe("view");
  expect(toNewViewResult.output).toBe(main.loadedCSV);
});

test("check output text if no CSV file is loaded", function () {
  const toNewViewResult: Result<string | CSV> = new View().run(
    ["view"],
    "view"
  );
  expect(toNewViewResult.command).toBe("view");
  expect(toNewViewResult.output).toBe("No CSV file loaded.");
});

test("check output text if incorrect args are provided", function () {
  const toNewViewResult: Result<string | CSV> = new View().run(
    ["view", "test"],
    "view"
  );
  expect(toNewViewResult.command).toBe("view");
  expect(toNewViewResult.output).toBe(
    "Exception: view expected 0 arguments but found 1."
  );
});

//testing search command
test("check correct output table for search result", function () {
  new Load().run(["load", "stringCSV.csv"], "load");
  const toNewSearchResult: Result<string | CSV> = new Search().run(
    ["search", "0", "tim"],
    "search"
  );
  expect(toNewSearchResult.command).toBe("search");
  expect(toNewSearchResult.output).toStrictEqual([
    ["tim", "nelson", "instructor"],
  ]);
});

test("correct output text when CSV loaded, search term does not exist", function () {
  new Load().run(["load", "stringCSV.csv"], "load");
  const toNewSearchResult: Result<string | CSV> = new Search().run(
    ["search", "1", "tim"],
    "search"
  );
  expect(toNewSearchResult.command).toBe("search");
  expect(toNewSearchResult.output).toBe("No search results found.");
});

test("correct output text when no CSV loaded", function () {
  const toNewSearchResult: Result<string | CSV> = new Search().run(
    ["search", "1", "tim"],
    "search"
  );
  expect(toNewSearchResult.command).toBe("search");
  expect(toNewSearchResult.output).toBe("No CSV file loaded.");
});

test("correct output text when invalid args are provided", function () {
  const toNewSearchResult: Result<string | CSV> = new Search().run(
    ["search", "tim"],
    "search"
  );
  expect(toNewSearchResult.command).toBe("search");
  expect(toNewSearchResult.output).toBe(
    "Exception: search expected 2 arguments but found 1."
  );
});

//Other tests
test("Command object creates the appropriate Result object", () => {
  const mockResult: Result<string> = {
    command: mockCommandText,
    outputCreator: new MockCreator(),
    output: mockCommandOutput,
    isResultVerbose: main.getIsModeVerbose()
  }

  const result: Result<string> = 
    new MockCommand().run(mockArgs, mockCommandText)

  expect(result.command).toBe(mockResult.command)
  expect(result.output).toBe(mockResult.output)
  expect(result.outputCreator instanceof MockCreator).toBe(true)
  expect(result.isResultVerbose).toBe(mockResult.isResultVerbose)
});

test("string correctly converted into args array", () => {
  expect(main.parseArgs(mockCommandText)).toStrictEqual(mockArgs);
  expect(main.parseArgs(`"'arg1'"`)).toStrictEqual(["'arg1'"]);
  expect(main.parseArgs(`"arg1 arg1"`)).toStrictEqual(["arg1 arg1"]);
  expect(main.parseArgs(`"arg1 arg1" arg2`)).toStrictEqual(["arg1 arg1", "arg2"]);
}
)