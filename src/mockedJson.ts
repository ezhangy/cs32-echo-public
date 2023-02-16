const emptyCSV = [[]];

const stringCSV = [
  ["tim", "nelson", "instructor"],
  ["john", "doe", "student"],
  ["jane", "doe", "student"],
];

const numberCSV = [
  [0, 1, 2],
  [2, 3, 4],
  [5, 3, 4],
];

const mockLoadMap: { [fileName: string]: Array<Array<string | number>> } = {
  ["emptyCSV.csv"]: emptyCSV,
  ["stringCSV.csv"]: stringCSV,
  ["numberCSV.csv"]: numberCSV,
};

const stringCSVSearchMap: { [searchTerm: string]: Array<number> } = {
  ["tim"]: [0],
  ["nelson"]: [0],
  ["instructor"]: [0],
  ["john"]: [1],
  ["jane"]: [2],
  ["doe"]: [1, 2],
  ["student"]: [1, 2],
};

const numberCSVSearchMap: { [searchTerm: string]: Array<number> } = {
  [0]: [0],
  [1]: [0],
  [2]: [0, 1],
  [3]: [1, 2],
  [4]: [1, 2],
  [5]: [2],
};

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export { mockLoadMap };
