// all exports from main will now be available as main.X
import * as main from "./main";

// Lets us use DTL's query library
import { screen } from "@testing-library/dom";
// Lets us send user events (like typing and clicking)
import userEvent from "@testing-library/user-event";
import { Command } from "./components/commands/allcommands.js";
import { Mode } from "./components/commands/Mode";
import { Result, ResultCreator } from "./ResultCreator";
import { ParagraphEltCreator } from "./components/utilityCreators/ParagraphEltCreator";
import { HTMLConverter } from "./components/HTMLConverter";
import { HTMLCreator } from "./components/HTMLCreator.types";


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
    return `<div>${javascriptObj}</div>`
  }
}

class MockCommand implements Command<string> {
  run(args: string[], commandText: string): Result<string> {
    return {
      command: commandText, 
      outputCreator: new MockCreator(),
      output: `args passed into the mock command: ${args.join(", ")}`,
      isResultVerbose: main.getIsModeVerbose()
    }
  }
}


let mockArgs: Array<string>;
let mockCommandText: string;
let mockCommandOutput: string;
let mockCreator: HTMLCreator<string>
let mockResult: Result<string>

let submitButton: HTMLButtonElement;
let commandInput: HTMLInputElement;


beforeEach(function () {
  main.clearHistory();
  main.resetMode();
  main.setDefaultCommandMap();
  document.body.innerHTML = startHTML;

  submitButton = screen.getByText("Submit");
  commandInput = screen.getByPlaceholderText("Input text here.");


  mockCommandText = "mock arg0 arg1 arg2";
  mockArgs = ["mock", "arg0", "arg1", "arg2"];
  mockCommandOutput = "args passed into the mock command: mock, arg0, arg1, arg2"
  mockCreator = new MockCreator();
});

//DOM tests

// mode tests, state management
test("application starts in brief mode", () => {
  expect(main.getIsModeVerbose()).toBe(false)
});


test("toggleVerbosity changes mode state", () => {
  main.toggleVerbosity();
  expect(main.getIsModeVerbose()).toBe(true);
  main.toggleVerbosity();
  expect(main.getIsModeVerbose()).toBe(false);
});

test("modeCommand changes mode state", () => {
  new Mode().run(["mode"], "mode")
  expect(main.getIsModeVerbose()).toBe(true);

  new Mode().run(["mode"], "mode")
  expect(main.getIsModeVerbose()).toBe(false);
});

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

test("running mock command creates the approriate HTML in the DOM", () => {
  main.setCommandMap({
    mock: new MockCommand()
  })
  main.updateCommandHistoryState(mockCommandText);
  main.renderCommandHistory();

  expect(screen.getByText(mockCommandOutput))
})

test("testing empty input", function () {
  userEvent.click(submitButton);
  expect(
    screen.getByTitle("Command Output").innerHTML == "submitted empty string"
  );
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
