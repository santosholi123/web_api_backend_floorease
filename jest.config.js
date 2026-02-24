module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  verbose: true,
  testMatch: ["**/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/testSetup.ts"],
};
