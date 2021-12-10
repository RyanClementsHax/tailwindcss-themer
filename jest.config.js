/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
};

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'jest-environment-jsdom',
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
//   testPathIgnorePatterns: ['<rootDir>[/\\\\](node_modules|.next)[/\\\\]'],
//   transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],
//   transform: {
//     '^.+\\.(ts|tsx)$': 'babel-jest'
//   },
//   watchPlugins: [
//     'jest-watch-typeahead/filename',
//     'jest-watch-typeahead/testname'
//   ],
//   moduleDirectories: ['node_modules', __dirname],
//   setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
//   resetMocks: true
// }
