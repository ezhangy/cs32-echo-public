// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareKeypress();
  prepareMouseClick();

  // If you're adding an event for a button click, do something similar.
  // The event name in that case is "click", not "keypress", and the type of the element
  // should be HTMLButtonElement. The handler function for a "click" takes no arguments.
};

function prepareKeypress() {
  // As far as TypeScript knows, there may be *many* elements with this class.
  const maybeInputs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-command-box");
  // Assumption: there's only one thing
  const maybeInput: Element | null = maybeInputs.item(0);
  // Is the thing there? Is it of the expected type?
  //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
  if (maybeInput == null) {
    console.log("Couldn't find input element");
  } else if (!(maybeInput instanceof HTMLInputElement)) {
    console.log(`Found element ${maybeInput}, but it wasn't an input`);
  } else {
    // Notice that we're passing *THE FUNCTION* as a value, not calling it.
    // The browser will invoke the function when a key is pressed with the input in focus.
    //  (This should remind you of the strategy pattern things we've done in Java.)
    maybeInput.addEventListener("keypress", handleKeypress);
  }
}

function prepareMouseClick() {
  const maybeInputs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-button");
  const maybeInput: Element | null = maybeInputs.item(0);
  // Is the thing there? Is it of the expected type?
  //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
  if (maybeInput == null) {
    console.log("Couldn't find input element");
  } else if (!(maybeInput instanceof HTMLButtonElement)) {
    console.log(`Found element ${maybeInput}, but it wasn't an input`);
  } else {
    // Notice that we're passing *THE FUNCTION* as a value, not calling it.
    // The browser will invoke the function when a key is pressed with the input in focus.
    //  (This should remind you of the strategy pattern things we've done in Java.)
    maybeInput.addEventListener("click", handleMouseClick);
    console.log("Found element");
  }
}

// We'll use a global state reference for now
let pressCount = 0;
function getPressCount() {
  return pressCount;
}

let clickCount = 0;
function getMouseClickCount() {
  return clickCount;
}

function handleKeypress(event: KeyboardEvent) {
  // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)
  pressCount = pressCount + 1;
  console.log(
    `key pressed: ${event.key}. ${getPressCount()} presses seen so far.`
  );
}

function handleMouseClick() {
  // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)
  clickCount = clickCount + 1;
  console.log(`${getMouseClickCount()} clicks seen so far.`);
}

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export { handleKeypress, prepareKeypress, getPressCount };
