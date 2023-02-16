import { HTMLCreator } from "./HTMLCreator.types";

export class HTMLableObject<T> {
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