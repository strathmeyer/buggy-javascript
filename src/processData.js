const fs = require("fs");
const readline = require("readline");

const processData = (
  inputFile,
  outputFile,
  errorMessageCallback,
  logMessageCallback,
  testCallback
) => {
  let reader;
  let output;
  let readStream;
  const closeReader = () => {
    reader && reader.close();
    readStream && readStream.destroy();
  };
  if (!inputFile) {
    errorMessageCallback &&
      errorMessageCallback("Usage: node processData.js input.txt");
    return;
  }
  // debugger
  const DEBUG = true;
  const writeToConsole = (txt = "") => {
    DEBUG && console.log(txt);
  };
  readStream = fs.createReadStream(inputFile);
  reader = readline.createInterface({
    input: readStream
  });
  output = fs.createWriteStream(outputFile, {
    flags: "a"
  });

  let count = 0;
  const MATCH_DAY_LIMITER = 4;
  const TOP_TEAMS_COUNT = 4;
  let matchDayEntries = [];
  const matchTotalsMap = {};

  reader.on("line", function(line) {
    count++;
    const match = line.match(
      /\s*([A-z\s]+?)\s*([0-9]+)\s*,\s*([A-z\s]+?)\s*([0-9]+)\s*/
    );
    if (match) {
      const score1 = +match[2];
      const score2 = +match[4];
      if (isNaN(score1) || isNaN(score2)) {
        errorMessageCallback &&
          errorMessageCallback(`Invalid score at line: ${count}`);
        closeReader();
      }
      if (!matchTotalsMap[match[1]]) {
        matchTotalsMap[match[1]] = 0;
      }
      if (!matchTotalsMap[match[3]]) {
        matchTotalsMap[match[3]] = 0;
      }
      if (score1 == score2) {
        // draw
        matchTotalsMap[match[1]] += 1;
        matchTotalsMap[match[3]] += 1;
        matchDayEntries.push(
          {
            key: match[1],
            val: matchTotalsMap[match[1]]
          },
          {
            key: match[3],
            val: matchTotalsMap[match[3]]
          }
        );
      } else if (score1 > score2) {
        matchTotalsMap[match[1]] += 3; // win
        matchTotalsMap[match[3]] += 0; // loss
        matchDayEntries.push(
          {
            key: match[1],
            val: matchTotalsMap[match[1]]
          },
          {
            key: match[3],
            val: matchTotalsMap[match[3]]
          }
        );
      } else if (score1 < score2) {
        matchTotalsMap[match[1]] += 0; // loss
        matchTotalsMap[match[3]] += 3; // win
        matchDayEntries.push(
          {
            key: match[1],
            val: matchTotalsMap[match[1]]
          },
          {
            key: match[3],
            val: matchTotalsMap[match[3]]
          }
        );
      }
    } else {
      errorMessageCallback &&
        errorMessageCallback(`Invalid entry at line: ${count}`);
      closeReader();
    }
    if (count % MATCH_DAY_LIMITER == 0) {
      matchDayEntries.sort((obj1, obj2) => {
        return obj2.val - obj1.val;
      });
      // check for incomplete matchday i.e. < 3 matches
      const title = `Matchday ${count / MATCH_DAY_LIMITER}`;
      writeToConsole(title);
      output.write(title);
      output.write("\n");
      for (let i = 0; i < TOP_TEAMS_COUNT; i++) {
        const result = `${matchDayEntries[i].key}, ${matchDayEntries[i].val} pts`;
        writeToConsole(result);
        output.write(result);
        output.write("\n");
      }
      writeToConsole();
      output.write("\n");
      matchDayEntries = [];
    }
  });
  reader.on("close", () => {
    output.end();
  });
  output.on("finish", () => {
    if (count == 0) {
      // empty file read
      fs.unlink(outputFile, err => err);
      errorMessageCallback && errorMessageCallback(`Empty file ${inputFile}`);
    } else {
      logMessageCallback &&
        logMessageCallback(`Output was saved to ${outputFile}`);
    }
    testCallback && testCallback();
  });
};

module.exports = processData;
