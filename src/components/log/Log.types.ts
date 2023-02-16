import { CSV } from "../csv/CSV.types";
import { HTMLCreator } from "../HTMLCreator.types";

interface CommandLog<T> {
  readonly command: string;
  readonly outputCreator: HTMLCreator<T>;
  readonly output: T;
  inVerboseMode: boolean;
}

interface ErrLog {
  readonly errMessage: string;
}

type CommandOutputType = string | CSV

type Log = CommandLog<CommandOutputType> | ErrLog;

export type { CommandLog, ErrLog, CommandOutputType, Log }