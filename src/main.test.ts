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

// Template HTML for test running
const startHTML = `
<div class="repl-history" id="outputDiv">
   <ul class="repl-output" title="Command Output"></ul>
</div>
<hr>
<div class="repl-input">
   <input type="text" class="repl-command-box" id="input-field" placeholder="Input text here.">
   <button type="button" class="submit-button">Submit</button>
</div>
`;
var submitButton: HTMLElement;
var inputText: HTMLElement;
beforeEach(function () {
  main.clearHistory();
  document.body.innerHTML = startHTML;

  submitButton = screen.getByText("Submit");
  inputText = screen.getByPlaceholderText("Input text here.");
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
    isResultVerbose: true
  }

  const resultConverter: HTMLConverter<Result<string>> = 
    new HTMLConverter(testResult, new ResultCreator())

  const resultChildren: HTMLCollectionOf<Element> = 
    resultConverter
      .toHTMLTemplate()
      .content
      .children
  
  console.log(resultConverter.toHTMLTemplate().innerHTML)

  expect(resultChildren.length).toBe(2)
  const commandTextParagraph = resultChildren[0]
  expect(commandTextParagraph instanceof HTMLParagraphElement).toBe(true)
  expect(commandTextParagraph.className).toBe(main.globalClassNames.COMMANDTEXT)

  const commandDivParagraph = resultChildren[1]
  expect(commandDivParagraph instanceof HTMLDivElement).toBe(true)
  expect(commandDivParagraph.className).toBe(main.globalClassNames.COMMANDOUTPUT)
});


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
