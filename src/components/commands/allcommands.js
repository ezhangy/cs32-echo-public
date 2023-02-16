import { Load } from "./Load.js";
import { Mode } from "./Mode.js";
import { Search } from "./Search.js";
import { View } from "./View.js";
const commandMap = {
    mode: new Mode(),
    load_file: new Load(),
    view: new View(),
    search: new Search(),
};
export { commandMap };
