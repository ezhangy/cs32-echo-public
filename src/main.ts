import { Command } from "./components/commands/Command.types.js";
import { Load } from "./components/commands/Load.js";
import { Mode } from "./components/commands/Mode.js";
import { Search } from "./components/commands/Search.js";
import { View } from "./components/commands/View.js";
import { ParagraphEltCreator } from "./components/creators/ParagraphEltCreator.js";
import { Result, ResultCreator } from "./components/creators/ResultCreator.js";
import { CSV } from "./components/csv/CSV.types.js";
import { HTMLConverter } from "./components/HTMLConverter.js";
import { mockLoadMap } from "./mockedJson.js";

// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareMouseClick();

  // If you're adding an event for a button click, do something similar.
  // The event name in that case is "click", not "keypress", and the type of the element
  // should be HTMLButtonElement. The handler function for a "click" takes no arguments.
};

// global class names
const globalClassNames = {
  COMMANDLOG: "command-log",
  ARROWSPAN: "console-arrow",
  COMMANDOUTPUT: "command-output",
  COMMANDOUTPUTLABEL: "command-output-label",
  COMMANDTEXTLABEL: "command-output-label",
  COMMANDTEXT: "command-text",
  BRIEFLOG: "brief-log",
  VERBOSELOG: "verbose-log"
}

let loadedCSV: CSV;
let history: Array<Result<any>> = [];


const defaultCommandMap:  { [commandName: string]: Command<any> } = {
    mode: new Mode(),
    load_file: new Load(),
    view: new View(),
    search: new Search(),
  };


let isModeVerbose: boolean = false;
function getIsModeVerbose(): boolean {
  return isModeVerbose
}

function setVerbosity(newIsModeVerbose: boolean): void {
  isModeVerbose = newIsModeVerbose;
}

function setLoadedCSV(csvToLoad: CSV) {
  loadedCSV = csvToLoad;
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
    maybeInput.addEventListener("click", () => updateHistoryAndRender(defaultCommandMap));
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

function parseArgs(inputStr: string): Array<string> {
  const regex: RegExp = /(?:[^\s"]+|"[^"]*")+/g;
  const regexMatches: RegExpMatchArray | null = inputStr.match(regex);
  const args: Array<string> =
    regexMatches != null
      ? stripWrapQuotes(regexMatches.filter((n) => n != null || n === " "))
      : [];
  return args
}

function stripWrapQuotes(rawArgs: Array<string>) {
  return rawArgs.map((arg) => {
    const endIndex: number = arg.length - 1;

    const hasWrapQuotes: boolean = (
      (arg[0] === '"' && arg[endIndex] === '"')
    )

    return hasWrapQuotes ? arg.substring(1, endIndex) : arg
  })
}

function pushHistoryElt(
  commandMap: { [commandName: string]: Command<any> }, 
  inputStr: string) {

  const args = parseArgs(inputStr)
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
    })
  }
}

function updateCommandHistoryState(commandMap: { [commandName: string]: Command<any> }) {
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
    const commandInput = maybeInput;
    pushHistoryElt(commandMap, commandInput.value)
    commandInput.value = "";
  }
}

function updateHistoryAndRender(commandMap: { [commandName: string]: Command<any> }) {
  updateCommandHistoryState(commandMap)
  console.log(`history: ${JSON.stringify(history)}`);
  renderCommandHistory();
}


function makeResultDiv(result: Result<any>): DocumentFragment {
  const resultTemplate: HTMLTemplateElement = document.createElement("template");
  const resultHTML: string = 
    new HTMLConverter<Result<any>>(result, new ResultCreator())
      .toHTMLTemplate()
      .innerHTML;
  
  const outputClassName = `${globalClassNames.COMMANDLOG} ${result.isResultVerbose 
    ? globalClassNames.VERBOSELOG
    : globalClassNames.BRIEFLOG}`

  resultTemplate.innerHTML = `
    <output class="${outputClassName}"/>
      <span class=${globalClassNames.ARROWSPAN}>></span> ${resultHTML}
    <output />`;

  return resultTemplate.content;
}


function makeResultDivList(history: Array<Result<any>>): Array<DocumentFragment> {
  return history.map(
    (result: Result<any>) => makeResultDiv(result)
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

function resetMode() {
  isModeVerbose = false;
}

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export {
  handleKeypress,
  resetMode,
  getIsModeVerbose,
  getPressCount,
  loadedCSV,
  mockLoadMap,
  setVerbosity,
  setLoadedCSV,
  clearHistory,
  getHistory,
  pushHistoryElt,
  updateCommandHistoryState,
  renderCommandHistory,
  defaultCommandMap,
  updateHistoryAndRender,
  globalClassNames,
  parseArgs
};
