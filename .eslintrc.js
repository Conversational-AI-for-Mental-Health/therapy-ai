module.exports = {
  root: true, // Stop ESLint from looking for configuration files in parent folders
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier", // Use eslint-config-prettier
    "plugin:react/recommended",
  ],
  rules: {
    // Custom rules or overrides here (e.g., forcing semi-colons, etc.)
    "@typescript-eslint/explicit-module-boundary-types": "off", // Example override
    "prettier/prettier": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
