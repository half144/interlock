import js from "@eslint/js";
import comments from "@eslint-community/eslint-plugin-eslint-comments";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const TS = ["**/*.{ts,tsx,mts,cts}"];
const APP_REACT = ["packages/app/**/*.{ts,tsx}"];
const TESTS = ["**/*.test.*", "**/*.spec.*", "**/__tests__/**", "**/__mocks__/**", "e2e/**"];
const SCRIPTS = ["**/scripts/**", "**/*.config.{js,cjs,mjs,ts,mts,cts}"];
const VIEW_FILES = ["packages/app/src/features/**/components/**/*.tsx"];
const PURE_FILES = [
  "packages/app/src/lib/**/*.{ts,tsx}",
  "packages/app/src/features/*/utils/**/*.{ts,tsx}",
  "packages/app/src/utils/**/*.{ts,tsx}",
];

const LEGACY_PACKAGES = "packages/{client,highlight,protocol,server}";
const LEGACY_UNTYPED = [
  `${LEGACY_PACKAGES}/**/*.{test,spec}.{ts,tsx}`,
  `${LEGACY_PACKAGES}/**/__tests__/**`,
  `${LEGACY_PACKAGES}/{examples,codegen,test-utils}/**`,
  `${LEGACY_PACKAGES}/src/**/{test-utils,testing,daemon-e2e}/**`,
];

const REACT_ONLY_IN_HOOKS = ["useEffect", "useLayoutEffect", "useReducer"];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/target/**",
      "**/*.gen.{ts,tsx}",
      "**/generated/**",
      "apps/desktop/src-tauri/**",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  js.configs.recommended,
  {
    files: TS,
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description", minimumDescriptionLength: 10 },
      ],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
  {
    // The forked packages' tsconfigs exclude their tests, examples and codegen, so the project service cannot type them.
    files: LEGACY_UNTYPED,
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    plugins: { "@eslint-community/eslint-comments": comments },
    rules: {
      "@eslint-community/eslint-comments/require-description": "error",
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/no-aggregating-enable": "error",
      "@eslint-community/eslint-comments/no-duplicate-disable": "error",
      "@eslint-community/eslint-comments/no-unused-enable": "error",
      "@eslint-community/eslint-comments/disable-enable-pair": "error",
    },
  },
  {
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": { typescript: true, node: true },
      "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx", ".mts", ".cts"] },
    },
    rules: {
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    files: APP_REACT,
    ...react.configs.flat.recommended,
    settings: { react: { version: "detect" } },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: APP_REACT,
    ...react.configs.flat["jsx-runtime"],
  },
  {
    files: APP_REACT,
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: APP_REACT,
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-max-depth": ["error", { max: 5 }],
      "react/jsx-no-useless-fragment": "error",
      "react/no-array-index-key": "error",
      "react/prop-types": "off",
    },
  },
  {
    rules: {
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 80, skipBlankLines: true, skipComments: true }],
      complexity: ["error", 12],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-nested-callbacks": ["error", 3],
      "no-nested-ternary": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "max-lines-per-function": ["error", { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: VIEW_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: REACT_ONLY_IN_HOOKS,
              message:
                "A view (.tsx) has no effects or reducers. Move this logic to the paired useX.ts hook next to it.",
            },
          ],
          patterns: [
            {
              group: ["@/stores/*", "**/stores/*"],
              message:
                "A view (.tsx) does not touch the store. Read it in the paired useX.ts hook.",
            },
            {
              group: ["@/daemon/*", "**/daemon/*"],
              message: "A view (.tsx) does not call the daemon. Do it in the paired useX.ts hook.",
            },
          ],
        },
      ],
    },
  },
  {
    files: PURE_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*", "react-dom", "react-dom/*"],
              message: "utils/ and lib/ are pure functions: no React. Move React code to a hook.",
            },
          ],
        },
      ],
    },
  },
  {
    files: TESTS,
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: SCRIPTS,
    languageOptions: { globals: globals.node },
    rules: {
      "no-console": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      complexity: "off",
    },
  },
);
