module.exports = {
  plugins: ["@firebase/security-rules"],
  parserOptions: {
    ecmaVersion: 2015,
  },
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    "@firebase/security-rules/no-unprotected-collections": "error",
  },
  overrides: [
    {
      files: ["*.rules"],
      rules: {
        "@firebase/security-rules/rule-lint": "error",
      },
    },
  ],
};
