import { mockJsonMap } from "./mockedJson.js";

// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareKeypress();
  prepareMouseClick();

  // If you're adding an event for a button click, do something similar.
  // The event name in that case is "click", not "keypress", and the type of the element
  // should be HTMLButtonElement. The handler function for a "click" takes no arguments.
};

abstract class HTMLableObject<T> {
  protected abstract makeInnerHTML(): string;
  readonly codeObj: T;

  constructor(codeObj: T) {
    this.codeObj = codeObj;
  }

  toHTMLTemplate(): HTMLTemplateElement {
    const template: HTMLTemplateElement = document.createElement("template");
    template.innerHTML = this.makeInnerHTML();
    return template;
  }
}

interface CommandLog<T> {
  readonly command: string;
  readonly output: HTMLableObject<T>;
  inVerboseMode: boolean;
}

interface ErrLog {
  readonly errMessage: string;
}

class ErrHTMLLog extends HTMLableObject<ErrLog> {
  readonly className: string;

  constructor(errLog: ErrLog) {
    super(errLog);
    this.className = "err-log";
  }

  protected makeInnerHTML(): string {
    const errLog: ErrLog = this.codeObj;
    return `<p>${this.codeObj.errMessage}</p>`;
  }
}

class ParagraphHTML extends HTMLableObject<string> {
  constructor(strObj: string) {
    super(strObj)
  }

  protected makeInnerHTML(): string {
    return `<p>${this.codeObj}</p>`
  }
}

class CommandHTMLLog<T> extends HTMLableObject<CommandLog<T>> {
  readonly className: string;

  constructor(commandLog: CommandLog<T>) {
    super(commandLog);
    this.className = "command-log";
  }

  protected makeInnerHTML(): string {
    const command: string = this.codeObj.command;
    const output: string = this.codeObj.output.toHTMLTemplate().innerHTML;
    const inVerboseMode: boolean = this.codeObj.inVerboseMode;

    return inVerboseMode
      ? `
          <p>Command: ${command}</p>
          <div class="command-output"><span>Output:</span>${output}</div>
      `
      : `
          <div class="command-output">${output}</div>
      `;
  }
}

// class TableOutput implements HTMLable {
//   output: string;
//   constructor(output: string) {
//     this.output = output;
//   }
//   toHTMLTemplate(): HTMLTemplateElement {
//     //TODO: return table elt
//     const template: HTMLTemplateElement = document.createElement("template")
//     template.innerHTML = this.output;
//     return template;
//   }
// }

type CommandFunction<T> = {
  (args: Array<string>): CommandHTMLLog<T>;
};

function stringToParagraphElt(str: string): HTMLParagraphElement {
  const paragraphElement: HTMLParagraphElement = document.createElement("p");
  const newContent: Text = document.createTextNode(str);
  paragraphElement.appendChild(newContent);
  return paragraphElement;
}

const modeCommand: CommandFunction<string> = (args) => {
  //TODO: think about checking args passed into the command
  isModeVerbose = !isModeVerbose;
  let output = `mode changed to ${isModeVerbose ? "verbose" : "brief"}`;
  const log: CommandLog<string> = {
    command: "mode",
    output: new ParagraphHTML(output),
    inVerboseMode: isModeVerbose,
  };
  return new CommandHTMLLog<string>(log);
};

let loadedCSV: Array<Array<string | number>>;

function loadHelper(filePath: string): boolean {
  if (filePath in mockJsonMap) {
    loadedCSV = mockJsonMap[filePath];
    return true;
  } else {
    return false;
  }
}

const loadCommand: CommandFunction<string> = (args) => {
  let toReturn = `Exception: load_file expected 1 argument but found ${
    args.length - 1
  }.`;
  if (args.length == 2) {
    if (loadHelper(args[1])) {
      toReturn = `Successfully loaded ${args[1]}.`;
    } else {
      toReturn = `Could not find ${args[1]}.`;
    }
  }

  return new CommandHTMLLog<string>({
    command: "load_file",
    output: new ParagraphHTML(toReturn),
    inVerboseMode: isModeVerbose,
  });
};

function viewHelper(): Array<Array<string | number>> | null {
  if (loadedCSV == undefined) {
    return null;
  } else {
    return loadedCSV;
  }
}

const viewCommand: CommandFunction<string> = (args) => {
  let toReturn = `Exception: view expected 0 arguments but found ${
    args.length - 1
  }.`;
  if (args.length == 2) {
    if (viewHelper() != null) {
      toReturn = `Successfully loaded ${args[1]}.`;
    } else {
      toReturn = `Could not find ${args[1]}.`;
    }
  }

  return new CommandHTMLLog<string>({
    command: "view",
    output: new ParagraphHTML(`view command executed with args: ${args}`),
    inVerboseMode: isModeVerbose,
  });
};

const searchCommand: CommandFunction<string> = (args) => {
  const log: CommandLog<string> = {
    command: "search",
    output: new ParagraphHTML(`search command executed with args: ${args}`),
    inVerboseMode: isModeVerbose,
  };

  return new CommandHTMLLog<string>(log);
};

let commandInput: HTMLInputElement;
let history: Array<CommandHTMLLog<string> | ErrHTMLLog> = [];

let isModeVerbose: boolean = false;
const commandMap: { [commandName: string]: CommandFunction<any> } = {
  mode: modeCommand,
  load_file: loadCommand,
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
  const args: Array<string> = commandInput.value.split(/\s+/).filter((n) => n);
  console.log(`args: ${JSON.stringify(args)}`);
  if (args.length === 0) {
    history.push(new ErrHTMLLog({ errMessage: "submitted empty string" }));
  } else if (args[0] in commandMap) {
    const commandFunction: CommandFunction<string> = commandMap[args[0]];
    history.push(commandFunction(args));
  } else {
    history.push(
      new ErrHTMLLog({ errMessage: `command ${args[0]} not found` })
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
      const logTemplate: HTMLTemplateElement = log.toHTMLTemplate();
      logTemplate.innerHTML = `
        <div ${log.className} />
          <span>></span> ${logTemplate.innerHTML}
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
