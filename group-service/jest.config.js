import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
  tsconfig: {
    rootDir: "src",
  },
});

export default {
  ...presetConfig,
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};