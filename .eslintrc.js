module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "prettier",
    ],
    overrides: [
      {
        env: {
          node: true,
        },
        files: [".eslintrc.{js,cjs}"],
        parserOptions: {
          sourceType: "script",
        },
      },
      {
        env: {
          jest: true,
        },
        files: ["./packages/mobile/**/**"],
      },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["@typescript-eslint", "react", "unused-imports"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "react/react-in-jsx-scope": 0,
      "react/prop-types": 0, // https://github.com/typescript-eslint/typescript-eslint/issues/3075,
      "@typescript-eslint/no-explicit-any": 0,
      "unused-imports/no-unused-imports-ts": "error",
      "react/no-unescaped-entities": 0,
    },
    ignorePatterns: [
      "node_modules",
      "dist",
      "public",
      "!.storybook",
      "packages/mobile/.storybook/storybook.requires.ts",
    ],
  };