const exampleCSV1 = [
  [1, 2, 3, 4, 5],
  ["The", "song", "remains", "the", "same."],
];

const exampleCSV2 = [
  ["a", "b", "c", "d", "e"],
  ["The", "song", "remains", "the", "same."],
];

const mockJsonMap: { [fileName: string]: Array<Array<string | number>> } = {
  ["/exampleCSV1.csv"]: exampleCSV1,
  ["/exampleCSV2.csv"]: exampleCSV2,
};

// Provide this to other modules (e.g., for testing!)
// The configuration in this project will require /something/ to be exported.
export { mockJsonMap };
