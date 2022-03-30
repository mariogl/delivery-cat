module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off",
    "no-continue": "off",
  },
};
