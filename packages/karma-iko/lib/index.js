const IkoFramework = require("./framework");
const IkoReporter = require("./reporter");

module.exports = {
  "framework:iko": ["factory", IkoFramework],
  "reporter:iko": ["type", IkoReporter],
};
