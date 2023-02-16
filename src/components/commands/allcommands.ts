import { Command } from "./Command.types";
import { Load } from "./Load";
import { Mode } from "./Mode";
import { Search } from "./Search";
import { View } from "./View";

const commandMap: { [commandName: string]: Command } = {
  mode: new Mode(),
  load_file: new Load(),
  view: new View(),
  search: new Search(),
};

export { commandMap };
export type { Command };