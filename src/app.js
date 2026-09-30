const express = require("express");
const _ = require("lodash");
const axios = require("axios");
const minimist = require("minimist");
const qs = require("qs");

const args = minimist(process.argv.slice(2));
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  const parsedQuery = qs.parse("project=dependencycheck&mode=demo");
  const numbers = [10, 20, 30];

  res.json({
    project: "DependencyCheck Demo",
    message: "Software supply-chain security test project",
    arguments: args,
    query: parsedQuery,
    total: _.sum(numbers),
    axiosLoaded: typeof axios.get === "function"
  });
});

app.listen(3001, () => {
  console.log("DependencyCheck demo running on port 3001");
});
