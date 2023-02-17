import { HTMLConverter } from "./components/HTMLConverter.js";
import { HTMLCreator } from "./components/HTMLCreator.types";

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
      ? `
        <p>Command: ${command}</p>
        <div class="command-output"><span>Output:</span>${outputHTML}</div>
        `
      : `<div class="command-output">${outputHTML}</div>`       
  }
}
