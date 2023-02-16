import { HTMLCreator } from "../HTMLCreator.types";
import { HTMLableObject } from "../HTMLableObject";
import { CommandLog, ErrLog } from "./Log.types";

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

class ErrLogCreator implements HTMLCreator<ErrLog> {
  makeInnerHTML(javascriptObj: ErrLog): string {
    return `<p>${javascriptObj.errMessage}</p>`;
  }
}

export { CommandLogCreator, ErrLogCreator };
