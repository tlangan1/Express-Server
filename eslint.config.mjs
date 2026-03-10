import js from "@eslint/js";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: { globals: { ...globals.node } },
  },
];
