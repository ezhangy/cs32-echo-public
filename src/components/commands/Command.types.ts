import { CommandLog, CommandOutputType } from "../log/Log.types";

export interface Command {
  run(args: Array<string>): CommandLog<CommandOutputType>
}