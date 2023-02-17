import { Result } from "../creators/ResultCreator";


export interface Command<T> {
  run(args: Array<string>, commandText: string): Result<T>
}