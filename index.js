const processData = require("./src/processData");

// Collect and validate inputs
const inputFile = process.argv[2];
const outputFile = process.argv[3] || `output-${new Date().getTime()}.txt`;
const errorMessageCallback = msg => console.error(msg);
const logMessageCallback = msg => console.log(msg);
processData(inputFile, outputFile, errorMessageCallback, logMessageCallback);
