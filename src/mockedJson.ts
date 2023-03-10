const emptyCSV: Array<Array<string | number>> = [];

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

const stringCSVSearchMap: {
  [searchTerm: string]: Array<Array<string | number>>;
} = {
  [JSON.stringify(["0", "tim"])]: [stringCSV[0]],
  [JSON.stringify(["1", "nelson"])]: [stringCSV[0]],
  [JSON.stringify(["2", "instructor"])]: [stringCSV[0]],
  [JSON.stringify(["0", "john"])]: [stringCSV[1]],
  [JSON.stringify(["0", "jane"])]: [stringCSV[2]],
  [JSON.stringify(["1", "doe"])]: [stringCSV[1], stringCSV[2]],
  [JSON.stringify(["2", "student"])]: [stringCSV[1], stringCSV[2]],
};

const numberCSVSearchMap: {
  [searchTerm: string]: Array<Array<string | number>>;
} = {
  [JSON.stringify(["0", "0"])]: [numberCSV[0]],
  [JSON.stringify(["1", "1"])]: [numberCSV[0]],
  [JSON.stringify(["0", "2"])]: [numberCSV[1]],
  [JSON.stringify(["2", "2"])]: [numberCSV[0]],
  [JSON.stringify(["1", "3"])]: [numberCSV[1], numberCSV[2]],
  [JSON.stringify(["2", "4"])]: [numberCSV[1], numberCSV[2]],
  [JSON.stringify(["0", "5"])]: [numberCSV[2]],
};

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export { mockLoadMap, stringCSVSearchMap, numberCSVSearchMap };
