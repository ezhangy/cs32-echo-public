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

test("testing empty input", function () {
  userEvent.click(submitButton);
  expect(
    screen.getByTitle("Command Output").innerHTML == "submitted empty string"
  );
});

//Other tests

test("is 1 + 1 = 2?", () => {
  expect(1 + 1).toBe(2);
});

// Notice: we're testing the keypress handler's effect on state and /nothing else/
//  We're not actually pressing keys!
//  We're not looking at what the console produces!
test("handleKeypress counting", () => {
  main.handleKeypress(new KeyboardEvent("keypress", { key: "x" }));
  expect(main.getPressCount()).toBe(1);
  main.handleKeypress(new KeyboardEvent("keypress", { key: "y" }));
  expect(main.getPressCount()).toBe(2);
});
