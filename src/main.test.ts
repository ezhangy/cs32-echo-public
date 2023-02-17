// all exports from main will now be available as main.X
import * as main from "./main";

// Lets us use DTL's query library
import { screen, within } from "@testing-library/dom";
// Lets us send user events (like typing and clicking)
import userEvent from "@testing-library/user-event";
import { Command, View } from "./components/commands/allcommands.js";
import { Mode } from "./components/commands/Mode";
import { Result, ResultCreator } from "./ResultCreator";
import { ParagraphEltCreator } from "./components/utilityCreators/ParagraphEltCreator";
import { HTMLConverter } from "./components/HTMLConverter";
import { HTMLCreator } from "./components/HTMLCreator.types";
import { Load } from "./components/commands/Load";
import { Search } from "./components/commands/Search";
import { CSV } from "./components/csv/CSV.types";

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

let submitButton: HTMLButtonElement;
let commandInput: HTMLInputElement;

beforeEach(function () {
  main.clearHistory();
  main.resetMode();
  main.resetLoadedCSV();
  document.body.innerHTML = startHTML;

  submitButton = screen.getByText("Submit");
  commandInput = screen.getByPlaceholderText("Input text here.");

  mockCommandText = "mock arg0 arg1 arg2";
  mockArgs = ["mock", "arg0", "arg1", "arg2"];
  mockCommandOutput =
    "args passed into the mock command: mock, arg0, arg1, arg2";
  mockCreator = new MockCreator();
});

//DOM tests

// mode tests, state management
test("application starts in brief mode", () => {
  expect(main.getIsModeVerbose()).toBe(false);
});

test("toggleVerbosity changes mode state", () => {
  main.toggleVerbosity();
  expect(main.getIsModeVerbose()).toBe(true);
  main.toggleVerbosity();
  expect(main.getIsModeVerbose()).toBe(false);
});

test("modeCommand changes mode state", () => {
  new Mode().run(["mode"], "mode");
  expect(main.getIsModeVerbose()).toBe(true);

  new Mode().run(["mode"], "mode");
  expect(main.getIsModeVerbose()).toBe(false);
});

test("Command object creates the appropriate Result object", () => {
  const mockResult: Result<string> = {
    command: mockCommandText,
    outputCreator: new MockCreator(),
    output: mockCommandOutput,
    isResultVerbose: main.getIsModeVerbose(),
  };

  const result: Result<string> = new MockCommand().run(
    mockArgs,
    mockCommandText
  );

  expect(result.command).toBe(mockResult.command);
  expect(result.output).toBe(mockResult.output);
  expect(result.outputCreator instanceof MockCreator).toBe(true);
  expect(result.isResultVerbose).toBe(mockResult.isResultVerbose);
});

test("running mock command creates the approriate HTML in the DOM", () => {
  const mockCommandMap = {
    mock: new MockCommand(),
  };
  main.updateCommandHistoryState(mockCommandMap, mockCommandText);
  main.renderCommandHistory();

  expect(screen.getByText(mockCommandOutput)).toBeTruthy();
});

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

// ResultCreator tests
test("(verbose mode) ResultCreator creates the appropriate DOM element", () => {
  const testResult: Result<string> = {
    command: "test command text",
    outputCreator: new ParagraphEltCreator(),
    output: "test output",
    isResultVerbose: true,
  };

  const resultConverter: HTMLConverter<Result<string>> = new HTMLConverter(
    testResult,
    new ResultCreator()
  );

  const resultChildren: HTMLCollectionOf<Element> =
    resultConverter.toHTMLTemplate().content.children;

  console.log(resultConverter.toHTMLTemplate().innerHTML);

  expect(resultChildren.length).toBe(2);
  const commandTextParagraph = resultChildren[0];
  expect(commandTextParagraph instanceof HTMLParagraphElement).toBe(true);
  expect(commandTextParagraph.className).toBe(
    main.globalClassNames.COMMANDTEXT
  );

  const commandDivParagraph = resultChildren[1];
  expect(commandDivParagraph instanceof HTMLDivElement).toBe(true);
  expect(commandDivParagraph.className).toBe(
    main.globalClassNames.COMMANDOUTPUT
  );
});

// //when a user submits an empty string, the correct output is present
// test("testing empty input", function () {
//   // userEvent.click(submitButton);
//   // expect(
//   //   screen.getByTitle("Command Output").innerHTML == "submitted empty string"
//   // );
// });

// //when a user submits a nonexistent command, the correct output is present
// test("testing empty input", function () {});

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
  main.updateCommandHistoryState(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.renderCommandHistory();

  expect(screen.getByText("Successfully loaded stringCSV.csv.")).toBeTruthy();
});

test("running load command with invalid path creates error element", () => {
  main.updateCommandHistoryState(main.defaultCommandMap, "load_file test.csv");
  main.renderCommandHistory();

  expect(screen.getByText("Could not find test.csv.")).toBeTruthy();
});

test("running load command with incorrect args creates error element", () => {
  main.updateCommandHistoryState(
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
  main.updateCommandHistoryState(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.updateCommandHistoryState(main.defaultCommandMap, "view");
  main.renderCommandHistory();

  const table = document.getElementsByTagName("table");
  expect(table.length).toBe(1);
  expect(within(table[0]).getByText("tim")).toBeTruthy();
});

test("creates error element if no CSV file is loaded", function () {
  main.updateCommandHistoryState(main.defaultCommandMap, "view");
  main.renderCommandHistory();

  expect(screen.getByText("No CSV file loaded.")).toBeTruthy();
});

test("creates error element if incorrect args are provided", function () {
  main.updateCommandHistoryState(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.updateCommandHistoryState(main.defaultCommandMap, "view test");
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
  main.updateCommandHistoryState(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.updateCommandHistoryState(main.defaultCommandMap, "search 0 tim");
  main.renderCommandHistory();

  const table = document.getElementsByTagName("table");
  expect(table.length).toBe(1);
  expect(within(table[0]).getByText("tim")).toBeTruthy();
});

test("creates error element when no CSV loaded", () => {
  main.updateCommandHistoryState(main.defaultCommandMap, "search 0 tim");
  main.renderCommandHistory();

  expect(screen.getByText("No CSV file loaded.")).toBeTruthy();
});

test("creates error element when incorrect arguments", () => {
  main.updateCommandHistoryState(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.updateCommandHistoryState(main.defaultCommandMap, "search tim");
  main.renderCommandHistory();

  expect(
    screen.getByText("Exception: search expected 2 arguments but found 1.")
  ).toBeTruthy();
});

test("creates text element when no search term exists", () => {
  main.updateCommandHistoryState(
    main.defaultCommandMap,
    "load_file stringCSV.csv"
  );
  main.updateCommandHistoryState(main.defaultCommandMap, "search 1 tim");
  main.renderCommandHistory();

  expect(screen.getByText("No search results found.")).toBeTruthy();
});

// test("repl-input exists", () => {
//   let repl_input: HTMLCollectionOf<Element> =
//     document.getElementsByClassName("repl-input");
//   expect(repl_input.length).toBe(1);
// });

// test("testing empty input", function () {
//   userEvent.click(submitButton);
//   expect(
//     document.getElementsByClassName("repl-command-box") == "submitted empty string"
//   ).toBe(true);
// });

// test("when the user keypressed", function () {
//   main.handleKeypress(new KeyboardEvent("keypress", { key: "x" }));
//   expect(inputText.innerText === "x").toBe(true);
// });

//Other tests

test("handleKeypress counting", () => {
  main.handleKeypress(new KeyboardEvent("keypress", { key: "x" }));
  expect(main.getPressCount()).toBe(1);
  main.handleKeypress(new KeyboardEvent("keypress", { key: "y" }));
  expect(main.getPressCount()).toBe(2);
});
