export interface HTMLCreator<T> {
  makeInnerHTML(javascriptObj: T): string;
}
