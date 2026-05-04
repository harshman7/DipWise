/** @type {import("orval").OrvalConfig} */
module.exports = {
  dipwise: {
    input: "./openapi.json",
    output: {
      mode: "single",
      target: "./src/generated/api.ts",
      client: "fetch",
      override: {
        mutator: {
          path: "./src/mutator.ts",
          name: "dipwiseFetch",
        },
      },
    },
  },
};
