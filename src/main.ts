// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareKeypress();
  prepareMouseClick();

  // If you're adding an event for a button click, do something similar.
  // The event name in that case is "click", not "keypress", and the type of the element
  // should be HTMLButtonElement. The handler function for a "click" takes no arguments.
};

interface HTMLable {
  toHTML(): Element;
}

class StringOutput implements HTMLable {
  output: string;

  constructor(output: string) {
    this.output = output;
  }
  toHTML() {
    return stringToParagraphElt(this.output);
  }
}

class CommandLog implements HTMLable {
  command: string;
  output: HTMLable;
  inVerboseMode: boolean;

  constructor(command: string, output: HTMLable, inVerboseMode: boolean) {
    this.command = command;
    this.output = output, 
    this.inVerboseMode = inVerboseMode
  }

  toHTML(): HTMLElement {
    const div = document.createElement("div")
    div.appendChild(this.output.toHTML())
    return div;
  }
}

class ErrLog implements HTMLable {
  errMessage: StringOutput;

  constructor(errMessage: StringOutput) {
    this.errMessage = errMessage;
  }

  toHTML(): HTMLElement {
    const div = document.createElement("div")
    div.appendChild(this.errMessage.toHTML())
    return div;
  }
}


class TableOutput implements HTMLable {
  output: string;
  constructor(output: string) {
    this.output = output;
  }
  toHTML() {
    //TODO: return table elt
    return stringToParagraphElt(this.output);
  }
}

type CommandFunction = (args: Array<String>) => HTMLable;

function stringToParagraphElt(str: string): HTMLParagraphElement {
  const paragraphElement: HTMLParagraphElement = document.createElement("p");
  const newContent: Text = document.createTextNode(str);
  paragraphElement.appendChild(newContent);
  return paragraphElement;
}

const modeCommand: CommandFunction = (args: Array<String>): HTMLable => {
  //TODO: think about checking args passed into the command
  let output = `mode changed to ${isModeVerbose ? "verbose" : "brief"}`;
  isModeVerbose = !isModeVerbose;
  return new StringOutput(
    `mode changed to ${isModeVerbose ? "verbose" : "brief"}`
  );
};

const loadCommand: CommandFunction = (args: Array<String>): HTMLable => {
  return new StringOutput(`loadcommand executed with args: ${args}`);
};

const viewCommand: CommandFunction = (args: Array<String>): HTMLable => {
  return new StringOutput(`loadcommand executed with args: ${args}`);
};

const searchCommand: CommandFunction = (args: Array<String>): HTMLable => {
  return new StringOutput(`loadcommand executed with args: ${args}`);
};

let commandInput: HTMLInputElement;
let history: Array<CommandLog | ErrLog> = [];
let isModeVerbose: boolean = false;
const commandMap: { [commandName: string]: CommandFunction } = {
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
  console.log(commandInput.value);
  updateHistoryAndRender();
}

function isDivPresent(maybeDiv: Element | null, className: string): boolean {
  if (maybeDiv == null) {
    console.log(`Couldn't find div with class ${className}`);
    return false;
  } else if (!(maybeDiv instanceof HTMLDivElement)) {
    console.log(`Found element ${maybeDiv}, but it wasn't a div`);
    return false;
  }
  return true;
}

function addToReplHistory(text: string) {
  //TODO: declare variable types
  const newLogElt = document.createElement("p");
  const newContent = document.createTextNode(text);
  newLogElt.appendChild(newContent);
  const maybeDivs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-history");
  const maybeDiv: Element | null = maybeDivs.item(0);
  if (isDivPresent(maybeDiv, "repl-history")) {
    maybeDiv?.append(newLogElt);
  }
  commandInput.value = "";
}

function updateCommandHistoryState() {
  const args: Array<string> = commandInput.value.split(/\s+/).filter((n) => n);
  console.log(`args: ${JSON.stringify(args)}`);
  if (args.length === 0) {
    history.push(new ErrLog(new StringOutput("submitted empty string")));
  } else if (args[0] in commandMap) {
    let oldIsModeVerbose = isModeVerbose;
    const commandFunction: CommandFunction = commandMap[args[0]];
    history.push(
      new CommandLog(args[0], commandFunction(args), oldIsModeVerbose));
  } else {
    history.push(new ErrLog(new StringOutput("command not found")));
  }
}

function updateHistoryAndRender() {
  updateCommandHistoryState();
  console.log(`history: ${JSON.stringify(history)}`);
  renderCommandHistory();
}

function renderCommandHistory() {
  const maybeDivs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-history");
  const maybeDiv: Element | null = maybeDivs.item(0);

  if (maybeDiv == null) {
    console.log(`Couldn't find div with class maybeDiv`);
  } else if (!(maybeDiv instanceof HTMLDivElement)) {
    console.log(`Found element ${maybeDiv}, but it wasn't a div`);
  } else {
    const replHistory: HTMLElement = maybeDiv;
    replHistory.innerHTML = ``;

    history.forEach((log) => {
        replHistory.append(log.toHTML());
    });
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
