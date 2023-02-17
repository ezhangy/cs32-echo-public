// all exports from main will now be available as main.X
import * as main from "./main";

// Lets us use DTL's query library
import { screen, within } from "@testing-library/dom";
// Lets us send user events (like typing and clicking)
import userEvent from "@testing-library/user-event";
import { Command, View } from "./components/commands/allcommands.js";
import { Mode } from "./components/commands/Mode";
import { ParagraphEltCreator } from "./components/creators/ParagraphEltCreator";
import { HTMLConverter } from "./components/HTMLConverter";
import { Load } from "./components/commands/Load";
import { Search } from "./components/commands/Search";
import { CSV, CSVRow } from "./components/csv/CSV.types";
import { Result } from "./components/creators/ResultCreator";
import { HTMLCreator } from "./components/creators/HTMLCreator.types";
import { CSVRowCreator, TableCreator } from "./components/csv/CSVCreators";

// Template HTML for test running
const startHTML: string = `
<div class="repl-history" id="outputDiv">
   <ul class="repl-output" title="Command Output"></ul>
</div>
<hr>
<div class="repl-input">
   <input type="text" class="repl-command-box" id="input-field" placeholder="Input text here.">
   <button type="button" class="submit-button">Submit</button>
</div>
`;

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

let mockCreator: HTMLCreator<string>;
let mockResult: Result<string>;
let mockCommandMap: { [commandName: string]: Command<any> }

let submitButton: HTMLButtonElement;
let commandInput: HTMLInputElement;

beforeEach(function () {
  main.clearHistory();
  main.resetMode();
  main.resetLoadedCSV();
  document.body.innerHTML = startHTML;

  submitButton = screen.getByText("Submit");
  commandInput = screen.getByPlaceholderText("Input text here.");

  mockCommandMap = {
    mock: new MockCommand()
  }
  mockCommandText = "mock arg0 arg1 arg2";
  mockArgs = ["mock", "arg0", "arg1", "arg2"];
  mockCommandOutput = "args passed into the mock command: mock, arg0, arg1, arg2"
})


// STATE MANAGEMENT TESTS
// history state
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


// DOM tests
test("(brief) running mock command creates the approriate HTML in the DOM", () => {
  main.pushHistoryElt(mockCommandMap, mockCommandText);
  main.pushHistoryElt(mockCommandMap, mockCommandText);
  main.renderCommandHistory();

  // check for output
  expect(screen.getAllByText(mockCommandOutput).length).toBe(2)

  // there should not be a match for "Command:"
  expect(screen.queryByText(/Command:\s?/)).toBe(null)
  // there should not be a match for "Output:"
  expect(screen.queryByText(/Output:\s?/)).toBe(null)
})

test("(verbose) running mock command creates the appropriate HTML in the DOM", () => {
  // set to verbose mode
  main.setVerbosity(true)
  main.pushHistoryElt(mockCommandMap, mockCommandText);
  main.pushHistoryElt(mockCommandMap, mockCommandText);
  main.renderCommandHistory();

  const commandTextRegex: RegExp = new RegExp(/Command:\s?/.source + mockCommandText)
  // check for Command: <command text>
  expect(screen.getAllByText(commandTextRegex).length).toBe(2)

  // check for Output: <output>
  expect(screen.getAllByText(/Output:\s?/).length).toBe(2)
  expect(screen.getAllByText(mockCommandOutput).length).toBe(2)
})

test("switching verbosity does not affect how previous command logs", () => {
  // should be brief
  main.pushHistoryElt(mockCommandMap, mockCommandText);

  // should be verbose
  main.setVerbosity(true)
  main.pushHistoryElt(mockCommandMap, mockCommandText);
  main.renderCommandHistory();

  // there should be exactly two logs with the output text
  expect(screen.getAllByText(mockCommandOutput).length).toBe(2)
  
  // there should be exactly one log that matches verbose format
  const commandTextRegex: RegExp = new RegExp(/Command:\s?/.source + mockCommandText)
  expect(screen.getByText(commandTextRegex))
  expect(screen.getByText(/Output:\s?/))
  
  // this should still be the case if verbosity is toggled back to brief
  main.setVerbosity(false)
  main.renderCommandHistory();
  expect(screen.getAllByText(mockCommandOutput).length).toBe(2)
  expect(screen.getByText(commandTextRegex))
  expect(screen.getByText(/Output:\s?/))
})

test("modeCommand returns correct Result", () => {
  const toVerboseResult: Result<string> = new Mode().run(["mode"], "mode");
  expect(toVerboseResult.command).toBe("mode");
  expect(toVerboseResult.output).toBe("mode changed to verbose");
  expect(toVerboseResult.isResultVerbose).toBe(true);

  const toBriefResult: Result<string> = new Mode().run(["mode"], "mode");
  expect(toBriefResult.command).toBe("mode");
  expect(toBriefResult.output).toBe("mode changed to brief");
  expect(toBriefResult.isResultVerbose).toBe(false);
});

// USER EVENT TESTS
test("clicking submit button clears command input", () => {
  submitButton.addEventListener("click", () => main.updateHistoryAndRender(mockCommandMap))
  userEvent.type(commandInput, "test")
  userEvent.click(submitButton)
  expect(commandInput.value).toBe("")
});

test("submitting invalid command outputs error message", function () {
  submitButton.addEventListener("click", () => main.updateHistoryAndRender(mockCommandMap))
  userEvent.type(commandInput, "test")
  
  expect(commandInput.value).toBe("test")
  userEvent.click(submitButton)
  expect(screen.getByText("command test not found"))
});

test("submitting empty input outputs error message", function () {
  submitButton.addEventListener("click", () => main.updateHistoryAndRender(mockCommandMap))
  expect(commandInput.value).toBe("")
  userEvent.click(submitButton)

  expect(screen.getByText("submitted empty string"))
});

test("submitting mock command generates correct output", () => {
  submitButton.addEventListener("click", () => main.updateHistoryAndRender(mockCommandMap))
  
  userEvent.type(commandInput, mockCommandText)
  expect(commandInput.value).toBe(mockCommandText)
  userEvent.click(submitButton)

  userEvent.type(commandInput, mockCommandText)
  userEvent.click(submitButton)

  expect(screen.getAllByText(mockCommandOutput).length).toBe(2)
})

test("args wrapped in quotes produce correct command output", () => {
  submitButton.addEventListener("click", () => main.updateHistoryAndRender(mockCommandMap))
  
  userEvent.type(commandInput, '"mock" "arg0" "arg1" "arg2"')
  userEvent.click(submitButton)
  expect(screen.getAllByText(mockCommandOutput).length).toBe(1)

  userEvent.type(commandInput, '"mock" "arg1 arg1" "arg2"')
  userEvent.click(submitButton)
  expect(
    screen.getAllByText("args passed into the mock command: mock, arg1 arg1, arg2").length)
    .toBe(1)
})

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

test("running load command creates appropriate output element", () => {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.renderCommandHistory();

  expect(screen.getByText("Successfully loaded stringCSV.csv.")).toBeTruthy();
});

test("running load command with invalid path creates error element", () => {
  main.pushHistoryElt(main.defaultCommandMap, "load_file test.csv");
  main.renderCommandHistory();

  expect(screen.getByText("Could not find test.csv.")).toBeTruthy();
});

test("running load command with incorrect args creates error element", () => {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv test"
  );
  main.renderCommandHistory();

  expect(
    screen.getByText("Exception: load_file expected 1 argument but found 2.")
  ).toBeTruthy();
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

test("running view command creates balanced/valid html table", () => {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.pushHistoryElt(main.defaultCommandMap, "view");
  main.renderCommandHistory();

  const table = document.getElementsByTagName("table");
  expect(table.length).toBe(1);
  expect(within(table[0]).getByText("tim")).toBeTruthy();
});

test("creates error element if no CSV file is loaded", function () {
  main.pushHistoryElt(main.defaultCommandMap, "view");
  main.renderCommandHistory();

  expect(screen.getByText("No CSV file loaded.")).toBeTruthy();
});

test("creates error element if incorrect args are provided", function () {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.pushHistoryElt(main.defaultCommandMap, "view test");
  main.renderCommandHistory();

  expect(
    screen.getByText("Exception: view expected 0 arguments but found 1.")
  ).toBeTruthy();
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

test("running search command creates correct html table", () => {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.pushHistoryElt(main.defaultCommandMap, "search 0 tim");
  main.renderCommandHistory();

  const table = document.getElementsByTagName("table");
  expect(table.length).toBe(1);
  expect(within(table[0]).getByText("tim")).toBeTruthy();
});

test("creates error element when no CSV loaded", () => {
  main.pushHistoryElt(main.defaultCommandMap, "search 0 tim");
  main.renderCommandHistory();

  expect(screen.getByText("No CSV file loaded.")).toBeTruthy();
});

test("creates error element when incorrect arguments", () => {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.pushHistoryElt(main.defaultCommandMap, "search tim");
  main.renderCommandHistory();

  expect(
    screen.getByText("Exception: search expected 2 arguments but found 1.")
  ).toBeTruthy();
});

test("creates text element when no search term exists", () => {
  main.pushHistoryElt(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.pushHistoryElt(main.defaultCommandMap, "search 1 tim");
  main.renderCommandHistory();

  expect(screen.getByText("No search results found.")).toBeTruthy();
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
  console.log(main.parseArgs(mockCommandText))
  expect(main.parseArgs(mockCommandText)).toStrictEqual(mockArgs);
  expect(main.parseArgs(`"'arg1'"`)).toStrictEqual(["'arg1'"]);
  expect(main.parseArgs(`"arg1 arg1"`)).toStrictEqual(["arg1 arg1"]);
  expect(main.parseArgs(`"arg1 arg1" arg2`)).toStrictEqual(["arg1 arg1", "arg2"]);
}
)