import { HTMLConverter } from "../HTMLConverter.js";
import { HTMLCreator } from "./HTMLCreator.types.js";
import { globalClassNames } from "../../main.js";

export interface Result<T> {
  command: string;
  outputCreator: HTMLCreator<T>
  output: T;
  isResultVerbose: boolean;
}

export class ResultCreator implements HTMLCreator<Result<any>> {
  makeInnerHTML(javascriptObj: Result<any>): string {
    const { command, outputCreator, output, isResultVerbose } = javascriptObj
    const outputHTML: string = new HTMLConverter(output, outputCreator)
                                .toHTMLTemplate()
                                .innerHTML;   
    return isResultVerbose
      ? `<div>
          <p class="${globalClassNames.COMMANDTEXT}">
            Command: ${command}
          </p>
          <div class="${globalClassNames.COMMANDOUTPUT}">
            <span class="${globalClassNames.COMMANDOUTPUTLABEL}">Output:</span>${outputHTML}
         </div>
        </div>`
      : `<div class="${globalClassNames.COMMANDOUTPUT}">${outputHTML}</div>`       
  }
}
