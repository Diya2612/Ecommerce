module.exports = {
  semi: true,
  trailingComma: 'all', // Includes function params (requires ES2017+, which we target)
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always', // (x) => x -- consistent with multi-param arrows and TypeScript style
  endOfLine: 'lf', // Enforces Unix line endings across all OSes; prevents CRLF in git diffs
};
