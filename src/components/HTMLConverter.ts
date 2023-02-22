import { HTMLCreator } from "./creators/HTMLCreator.types.js";

export class HTMLConverter<T> {
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