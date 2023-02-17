## Project details

### Project name: Echo (Sprint 2)

### Team members and contributions (include cs logins):

- Lizzy Zhang (ezhang29)
- Jakob Wismar (jwismar)

### Estimated time to complete project: 15 hours

### GitHub repository: [Link](https://github.com/cs0320-s2023/sprint-2-ezhang29-jwismar)

## Design Choices

### Explain the relationships between classes/interfaces.

TODO: EXPLAIN

### Discuss any specific data structures you used, why you created it, and other high level explanations.

TODO: EXPLAIN

### Runtime/space optimizations you made (if applicable)

TODO: EXPLAIN

## **Errors/Bugs**

We are not aware of any errors/bugs in our project.

## Tests

Explain the testing suites that you implemented for your program and how each test ensures that a part of the program works.

### **User Story 1 (mode/history)**

**history** - **state management**

- when the input button is clicked five elements appear in the history state

**general input**

- when the user keypresses, the string appears in the commandInput.value
- after the user clicks submit, commandInput.value is reset to an empty string

**mode - state management**

- Main starts with with isModeVerbose === false (in brief mode)
- when toggleVerbosity() is called directly from main, the mode toggles
- when modeCommand is called, the mode toggles in main
- Mode.run returns correct Result objects

**testing verbosity text**

- output when isModeVerbose is false
- output when isModeVerbose is true
- old output does not change when you switch modes

### **User Story 2 (load_file)**

**testing switching datasets (checking correct value of loadedCSV and output text)**

- After entering load_file <file path>, loadedCSV should be updated to match the contents of the file path

- result.output should equal “Successfully loaded [file path]”, then

- When the file path is not valid, result.output should equal “Successfully loaded [file path]”,

**checking correct output text if an incorrect number of arguments is provided**

- When an incorrect number of arguments is provided, the result.output element string “Exception: load_file expected 1 argument but found [number of arguments].”

### **User Story 3 (view)**

- checking presence of balanced/valid html table
- Check correct output table
- checking presence of output text if no CSV file is loaded
- check correct output text when invalid args are provided

### **User Story 4 (search)**

- check correct HTML table
- Check correct output table
- check correct output text when CSV loaded, search term does not exist
- check correct output text when no CSV loaded
- check correct output text when invalid args are provided

## How to…

### Run the tests you wrote/were provided

In the project root directory, execute `npm test`.

### Build and run your program

Set the live server root to the project directory, and open `http://127.0.0.1:5500/public/index.html`.
