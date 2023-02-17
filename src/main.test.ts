// all exports from main will now be available as main.X
import * as main from "./main";

// Lets us use DTL's query library
import { screen } from "@testing-library/dom";
// Lets us send user events (like typing and clicking)
import userEvent from "@testing-library/user-event";

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
  expect(main.isModeVerbose).toBe(false)
});


test("testing empty input", function () {
  userEvent.click(submitButton);
  expect(
    screen.getByTitle("Command Output").innerHTML == "submitted empty string"
  );
});

=======
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

test("display mode switches upon mode command", () => {
  const oldIsModeVerbose = main.isModeVerbose;
  main.toggleVerbosity();
  expect(main.isModeVerbose).toBe(!oldIsModeVerbose);
});

test("handleKeypress counting", () => {
  main.handleKeypress(new KeyboardEvent("keypress", { key: "x" }));
  expect(main.getPressCount()).toBe(1);
  main.handleKeypress(new KeyboardEvent("keypress", { key: "y" }));
  expect(main.getPressCount()).toBe(2);
});
