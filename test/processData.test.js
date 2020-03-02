const assert = require("assert");
const fs = require("fs");
const processData = require("../src/processData");

describe("Process Data", () => {
  const files = [];
  after(() => {
    files.forEach(file =>
      fs.unlinkSync(file, err => {
        if (err) {
          console.log(file);
          console.log(err);
        }
      })
    );
  });
  it("should render response on valid data for formatted input", done => {
    const filename = "test-output-1.txt";
    files.push(filename);
    processData(
      "test/fixtures/formattedInput.txt",
      filename,
      null,
      null,
      () => {
        const outputBuff = fs.readFileSync("test/fixtures/formattedOutput.txt");
        const genOutputBuff = fs.readFileSync(filename);
        assert.equal(outputBuff.equals(genOutputBuff), true);
        done();
      }
    );
  });
  it("should render response on valid data for unformatted input", done => {
    const filename = "test-output-2.txt";
    files.push(filename);
    processData(
      "test/fixtures/unformattedInput.txt",
      filename,
      null,
      null,
      () => {
        const outputBuff = fs.readFileSync("test/fixtures/formattedOutput.txt");
        const genOutputBuff = fs.readFileSync(filename);
        assert.equal(outputBuff.equals(genOutputBuff), true);
        done();
      }
    );
  });
  it("should show usage for missing input file", done => {
    const filename = "test-output-3.txt";
    processData(null, filename, msg => {
      assert.equal(msg, "Usage: node processData.js input.txt");
      done();
    });
  });
  it("should throw error on malformed file contents", done => {
    const filename = "test-output-4.txt";
    files.push(filename);
    processData("test/fixtures/errorInput.txt", filename, msg => {
      assert.equal(msg, "Invalid entry at line: 1");
      done();
    });
  });
  it("should throw error on empty file contents", done => {
    const filename = "test-output-5.txt";
    // files.push(filename);
    const inputFile = "test/fixtures/emptyInput.txt";
    processData(inputFile, filename, msg => {
      assert.equal(msg, `Empty file ${inputFile}`);
      done();
    });
  });
  it("should not print a matchday with < 3 matches", done => {
    const filename = "test-output-6.txt";
    files.push(filename);
    processData(
      "test/fixtures/ignoreMatchday4Input.txt",
      filename,
      null,
      null,
      () => {
        const outputBuff = fs.readFileSync(
          "test/fixtures/ignoreMatchday4Output.txt"
        );
        const genOutputBuff = fs.readFileSync(filename);
        assert.equal(outputBuff.equals(genOutputBuff), true);
        done();
      }
    );
  });
});
