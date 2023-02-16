import { HTMLableObject } from "../HTMLableObject.js";
class CommandLogCreator {
    makeInnerHTML(obj) {
        const commandLog = obj;
        const outputHTMLable = new HTMLableObject(commandLog.output, commandLog.outputCreator);
        const outputHTML = outputHTMLable.toHTMLTemplate().innerHTML;
        return commandLog.inVerboseMode
            ? `
        <p>Command: ${commandLog.command}</p>
        <div class="command-output"><span>Output:</span>${outputHTML}</div>
        `
            : `<div class="command-output">${outputHTML}</div>`;
    }
}
class ErrLogCreator {
    makeInnerHTML(javascriptObj) {
        return `<p>${javascriptObj.errMessage}</p>`;
    }
}
export { CommandLogCreator, ErrLogCreator };
