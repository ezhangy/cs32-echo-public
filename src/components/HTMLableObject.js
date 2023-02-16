export class HTMLableObject {
    constructor(codeObj, creator) {
        this.codeObj = codeObj;
        this.creator = creator;
    }
    toHTMLTemplate() {
        const template = document.createElement("template");
        template.innerHTML = this.creator.makeInnerHTML(this.codeObj);
        return template;
    }
}
