// eslint.config.mjs - Detailed Configuration
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript Rules
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type for now
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ], // Allow unused vars with _ prefix

      // Next.js Rules
      "@next/next/no-img-element": "off", // Allow <img> elements

      // React Rules
      "react/no-unescaped-entities": [
        "warn",
        {
          forbid: [
            {
              char: ">",
              alternatives: ["&gt;"],
            },
            {
              char: "}",
              alternatives: ["&#125;"],
            },
          ],
        },
      ],
      "react-hooks/exhaustive-deps": "warn",

      // General Rules
      "no-console": "off", // Allow console logs
      "prefer-const": "warn",
      "no-var": "error",
    },
  },
  {
    // Specific rules for specific file patterns
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // More lenient for TS files
    },
  },
  {
    // Rules for API routes
    files: ["**/api/**/*.ts", "**/route.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // More lenient for API routes
    },
  },
];

export default eslintConfig;
