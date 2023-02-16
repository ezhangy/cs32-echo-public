import { HtmlHTMLAttributes } from "react";
import { mockLoadMap } from "./mockedJson.js";

// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareKeypress();
  prepareMouseClick();

  // If you're adding an event for a button click, do something similar.
  // The event name in that case is "click", not "keypress", and the type of the element
  // should be HTMLButtonElement. The handler function for a "click" takes no arguments.
};


interface HTMLCreator<T> {
  makeInnerHTML(javascriptObj: T): string;
}

class HTMLableObject<T> {
  readonly codeObj: T;
  private readonly creator: HTMLCreator<T>;

  constructor(codeObj: T, creator: HTMLCreator<T>) {
    this.codeObj = codeObj;
    this.creator = creator;
  }

  toHTMLTemplate(): HTMLTemplateElement {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = this.creator.makeInnerHTML(this.codeObj);
    return template;
  }
}


class ParagraphEltCreator implements HTMLCreator<string> {
  makeInnerHTML(javascriptObj: string): string {
    return `<p>${javascriptObj}</p>`;
  }
}

interface CommandLog<T> {
  readonly command: string;
  readonly outputCreator: HTMLCreator<T>;
  readonly output: T;
  inVerboseMode: boolean;
}

interface ErrLog {
  readonly errMessage: string;
}

class ErrLogCreator implements HTMLCreator<ErrLog> {
  makeInnerHTML(javascriptObj: ErrLog): string {
    return `<p>${javascriptObj.errMessage}</p>`;
  }
}

class TableCreator implements HTMLCreator<CSV> {
  private makeInnerHTMLHelper(cell: string | number): string {
    let cellStr;
    if (typeof cell === "number") {
      cellStr = cell.toString();
    } else {
      cellStr = cell;
    }
    return `<td>${cell}</td>`;
  }

  makeInnerHTML(javascriptObj: CSV): string {
     return `<table>${javascriptObj
      .map((row) => {
        return `<tr>${row
          .map((cell) => this.makeInnerHTMLHelper(cell))
          .join("\n")}</tr>`;
      })
      .join("\n")}</table>`;
  }
}

class CommandLogCreator<T> implements HTMLCreator<CommandLog<T>>{
  makeInnerHTML(obj: CommandLog<T>): string {
    const commandLog: CommandLog<T> = obj;
    const outputHTMLable: HTMLableObject<T> = 
      new HTMLableObject<T>(commandLog.output, commandLog.outputCreator)
    const outputHTML = outputHTMLable.toHTMLTemplate().innerHTML;
    return commandLog.inVerboseMode 
      ? `
        <p>Command: ${commandLog.command}</p>
        <div class="command-output"><span>Output:</span>${outputHTML}</div>
        `
      : `<div class="command-output">${outputHTML}</div>`
  }
}


type CommandFunction<T> = {
  (args: Array<string>): CommandLog<T>;
};

type Log = CommandLog<CommandOutputType> | ErrLog;


const modeCommand: CommandFunction<string> = (args) => {
  //TODO: think about checking args passed into the command
  isModeVerbose = !isModeVerbose;
  let output = `mode changed to ${isModeVerbose ? "verbose" : "brief"}`;
  const log: CommandLog<string> = {
    command: "mode",
    outputCreator: new ParagraphEltCreator(),
    output: output,
    inVerboseMode: isModeVerbose,
  };
  return log;
};

let loadedCSV: CSV;

function loadHelper(filePath: string): boolean {
  if (filePath in mockLoadMap) {
    loadedCSV = mockLoadMap[filePath];
    return true;
  } else {
    return false;
  }
}

const loadCommand: CommandFunction<string> = (args) => {
  let output = `Exception: load_file expected 1 argument but found ${
    args.length - 1
  }.`;
  if (args.length == 2) {
    if (loadHelper(args[1])) {
      output = `Successfully loaded ${args[1]}.`;
    } else {
      output = `Could not find ${args[1]}.`;
    }
  }

  return {
    command: "load_file",
    outputCreator: new ParagraphEltCreator(),
    output: output,
    inVerboseMode: isModeVerbose,
  };
};

function viewHelper(): CSV | null {
  if (loadedCSV == undefined) {
    return null;
  } else {
    return loadedCSV;
  }
}

const viewCommand: CommandFunction<CSV | string> = (args) => {
  let output:
    | string
    | Array<
        Array<string | number>
      > = `Exception: view expected 0 arguments but found ${args.length - 1}.`;
  if (args.length == 1) {
    if (viewHelper() != null) {
      console.log(`loadedCSV is ${JSON.stringify(loadedCSV)}`)
    } else {
      output = `No CSV file loaded.`;
    }
  }

  return {
    command: "view",
    outputCreator: typeof output === "string"
      ? new ParagraphEltCreator
      : new TableCreator,
    output: output,
    inVerboseMode: isModeVerbose,
  }
};

const searchCommand: CommandFunction<string> = (args) => {
  const log: CommandLog<string> = {
    command: "search",
    outputCreator: new ParagraphEltCreator(),
    output: `search command executed with args: ${args}`,
    inVerboseMode: isModeVerbose,
  };
  return log
};

let commandInput: HTMLInputElement;
let history: Array<CommandLog<CSV | string>| ErrLog> = [];

type CSVRow = Array<string | number>;
type CSV = Array<CSVRow>;
type CommandOutputType = string | CSV

let isModeVerbose: boolean = false;
const commandMap: { [commandName: string]: CommandFunction<CommandOutputType> } = {
  mode: modeCommand,
  load_file: loadCommand,
  view: viewCommand,
  search: searchCommand,
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

// function handleMouseClick() {
//   // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)
//   clickCount = clickCount + 1;
//   console.log(`${getMouseClickCount()} clicks seen so far.`);
//   console.log(commandInput.value);
//   updateHistoryAndRender();
// }

function isDivPresent(maybeDiv: Element | null, className: string): boolean {
  if (maybeDiv == null) {
    console.log(`Couldn't find div with class ${className}`);
    return false;
  } else if (!(maybeDiv instanceof HTMLDivElement)) {
    console.log(`Found element ${maybeDiv},but it wasn't a div`);
    return false;
  }
  return true;
}

function updateCommandHistoryState() {
  const regex: RegExp = /[^\s]+|"(.*?)"/g
  const regexMatches: RegExpMatchArray | null = commandInput.value.match(regex);
  const args: Array<string> = regexMatches != null 
    ? regexMatches.filter(n => n != null || n === " ")
    : []

  console.log(`args: ${JSON.stringify(args)}`);
  console.log(`view in commandMap ${"view" in commandMap}`)
  if (args.length === 0) {
    history.push({ errMessage: "submitted empty string" });
  } else if (args[0] in commandMap) {
    const commandFunction: CommandFunction<CommandOutputType> = commandMap[args[0]];
    history.push(commandFunction(args));
  } else {
    history.push(
      { errMessage: `command ${args[0]} not found` }
    );
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
      let logTemplate: HTMLTemplateElement = document.createElement("template")
      let logHTMLObj: HTMLableObject<Log>;
      let className: string;
      if ("errMessage" in log) {
        logHTMLObj = new HTMLableObject(log, new ErrLogCreator())
        className = "err-log"
      } else {
        logHTMLObj = new HTMLableObject(log, new CommandLogCreator())
        className = "command-log"
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
export { handleKeypress, prepareKeypress, getPressCount };
