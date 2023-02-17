import { HTMLCreator } from "./HTMLCreator.types.js";

export class ParagraphEltCreator implements HTMLCreator<string> {
  makeInnerHTML(javascriptObj: string): string {
    return `<p>${javascriptObj}</p>`;
  }
}