import { HTMLConverter } from "../HTMLConverter.js";
import { globalClassNames } from "../../main.js";
export class ResultCreator {
    makeInnerHTML(javascriptObj) {
        const { command, outputCreator, output, isResultVerbose } = javascriptObj;
        const outputHTML = new HTMLConverter(output, outputCreator)
            .toHTMLTemplate()
            .innerHTML;
        return isResultVerbose
            ? `<p class="${globalClassNames.COMMANDTEXT}">
          Command: ${command}
        </p>
        <div class="${globalClassNames.COMMANDOUTPUT}">
          <span class="${globalClassNames.COMMANDOUTPUTLABEL}">Output:</span>${outputHTML}
        </div>`
            : `<div class="${globalClassNames.COMMANDOUTPUT}">${outputHTML}</div>`;
    }
}
