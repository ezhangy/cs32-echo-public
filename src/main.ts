import { mockLoadMap } from "./mockedJson.js";
import { HTMLableObject } from "./components/HTMLableObject.js";
import { CSV } from "./components/csv/CSV.types.js";
import { Log, CommandLog, ErrLog } from "./components/log/Log.types.js";
import {
  CommandLogCreator,
  ErrLogCreator,
} from "./components/log/LogCreators.js";
import { commandMap, Command } from "./components/commands/allcommands.js";

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
let history: Array<CommandLog<CSV | string> | ErrLog> = [];
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
  const regex: RegExp = /[^\s]+|"(.*?)"/g;
  const regexMatches: RegExpMatchArray | null = commandInput.value.match(regex);
  const args: Array<string> =
    regexMatches != null
      ? regexMatches.filter((n) => n != null || n === " ")
      : [];

  console.log(`args: ${JSON.stringify(args)}`);
  console.log(`view in commandMap ${"view" in commandMap}`);
  if (args.length === 0) {
    history.push({ errMessage: "submitted empty string" });
  } else if (args[0] in commandMap) {
    const command: Command = commandMap[args[0]];
    history.push(command.run(args));
  } else {
    history.push({ errMessage: `command ${args[0]} not found` });
  }
}

function updateHistoryAndRender() {
  updateCommandHistoryState();
  commandInput.value = "";
  console.log(`history: ${JSON.stringify(history)}`);
  renderCommandHistory();
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
    const historyDiv: Element = maybeHistoryDiv;
    const logDivs: Array<DocumentFragment> = history.map((log) => {
      let logTemplate: HTMLTemplateElement = document.createElement("template");
      let logHTMLObj: HTMLableObject<Log>;
      let className: string;
      if ("errMessage" in log) {
        logHTMLObj = new HTMLableObject(log, new ErrLogCreator());
        className = "err-log";
      } else {
        logHTMLObj = new HTMLableObject(log, new CommandLogCreator());
        className = "command-log";
      }

      logTemplate.innerHTML = `
        <div ${className} />
          <span>></span> ${logHTMLObj.toHTMLTemplate().innerHTML}
        <div />
      `;
      return logTemplate.content;
    });
    historyDiv.replaceChildren(...logDivs);
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
  clearHistory,
};
