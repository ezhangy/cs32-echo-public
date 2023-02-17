import { mockLoadMap } from "./mockedJson.js";
import { CSV } from "./components/csv/CSV.types.js";
import { commandMap, Command } from "./components/commands/allcommands.js";
import { HTMLConverter } from "./components/HTMLConverter.js";
import { Result, ResultCreator } from "./ResultCreator.js";
import { ParagraphEltCreator } from "./components/utilityCreators/ParagraphEltCreator.js";

// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareKeypress();
  prepareMouseClick();

  // If you're adding an event for a button click, do something similar.
  // The event name in that case is "click", not "keypress", and the type of the element
  // should be HTMLButtonElement. The handler function for a "click" takes no arguments.
};

let loadedCSV: CSV;
let commandInput: HTMLInputElement;
let history: Array<Result<any>> = [];
let isModeVerbose: boolean = false;

function toggleVerbosity(): void {
  isModeVerbose = isModeVerbose;
  isModeVerbose = !isModeVerbose;
}

function setLoadedCSV(csvToLoad: CSV) {
  loadedCSV = csvToLoad;
}

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
    commandInput = maybeInput;
    commandInput.addEventListener("keypress", handleKeypress);
  }
}

function prepareMouseClick() {
  const maybeInputs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-button");
  const maybeInput: Element | null = maybeInputs.item(0);
  if (maybeInput == null) {
    console.log("Couldn't find input element");
  } else if (!(maybeInput instanceof HTMLButtonElement)) {
    console.log(`Found element ${maybeInput}, but it wasn't an input`);
  } else {
    // Notice that we're passing *THE FUNCTION* as a value, not calling it.
    // The browser will invoke the function when a key is pressed with the input in focus.
    //  (This should remind you of the strategy pattern things we've done in Java.)
    maybeInput.addEventListener("click", updateHistoryAndRender);
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

function updateCommandHistoryState() {
  const inputStr: string = commandInput.value;

  const regex: RegExp = /[^\s]+|"(.*?)"/g;
  const regexMatches: RegExpMatchArray | null = inputStr.match(regex);
  const args: Array<string> =
    regexMatches != null
      ? regexMatches.filter((n) => n != null || n === " ")
      : [];

  console.log(`args: ${JSON.stringify(args)}`);
  console.log(`view in commandMap ${"view" in commandMap}`);
  if (args.length === 0) {
    history.push({ 
      command: inputStr,
      output: "submitted empty string",
      outputCreator: new ParagraphEltCreator(),
      isResultVerbose: isModeVerbose
    });
  } else if (args[0] in commandMap) {
    const command: Command<any> = commandMap[args[0]];
    history.push(command.run(args, inputStr));
  } else {
    history.push({ 
      command: inputStr,
      output: `command ${args[0]} not found`,
      outputCreator: new ParagraphEltCreator(),
      isResultVerbose: isModeVerbose
    });
  }
}

function updateHistoryAndRender() {
  updateCommandHistoryState();
  commandInput.value = "";
  console.log(`history: ${JSON.stringify(history)}`);
  renderCommandHistory();
}


function makeResultDiv(result: Result<any>, className: string): DocumentFragment {
  const resultTemplate: HTMLTemplateElement = document.createElement("template");
  const resultHTML: string = 
    new HTMLConverter<Result<any>>(result, new ResultCreator())
      .toHTMLTemplate()
      .innerHTML;

  resultTemplate.innerHTML = `
    <div ${className} />
      <span>></span> ${resultHTML}
    <div />
  `;

  return resultTemplate.content;
}


function makeResultDivList(history: Array<Result<any>>): Array<DocumentFragment> {
  return history.map(
    (result: Result<any>) => makeResultDiv(result, "command-log")
  )
}


function renderCommandHistory() {
  const maybeHistoryDivs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-history");
  const maybeHistoryDiv: Element | null = maybeHistoryDivs.item(0);

  if (maybeHistoryDiv == null) {
    console.log(`Couldn't find div with class "repl-history"`);
  } else if (!(maybeHistoryDiv instanceof HTMLDivElement)) {
    console.log(`Found element ${maybeHistoryDiv}, but it wasn't a div`);
  } else {
    // TODO: make historyDiv global
    const historyDiv: Element = maybeHistoryDiv;
    historyDiv.replaceChildren(...makeResultDivList(history));
  }
}

function clearHistory() {
  history = [];
}

function getHistory() {
  //defensive copy
  return history.slice();
}

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export {
  handleKeypress,
  prepareKeypress,
  getPressCount,
  isModeVerbose,
  loadedCSV,
  mockLoadMap,
  toggleVerbosity,
  setLoadedCSV,
};
