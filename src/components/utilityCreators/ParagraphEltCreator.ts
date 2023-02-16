import { HTMLCreator } from "../HTMLCreator.types";

export class ParagraphEltCreator implements HTMLCreator<string> {
  makeInnerHTML(javascriptObj: string): string {
    return `<p>${javascriptObj}</p>`;
  }
}