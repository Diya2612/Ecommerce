import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Architecture enforcement rules
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      // Prevent importing from deprecated service layer
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/services/*"],
              message: "⚠️ Deprecated: Import from @/queries instead of @/services",
            },
            {
              group: ["@/lib/api-client"],
              message: "⚠️ Deprecated: Use @/api instead of @/lib/api-client",
            },
            {
              group: ["@/lib/server-api-client"],
              message: "⚠️ Deprecated: Use @/api instead of @/lib/server-api-client",
            },
          ],
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Deprecated files (pending deletion)
    "src/services/**",
    "src/lib/api-client.ts",
    "src/lib/server-api-client.ts",
  ]),
]);

export default eslintConfig;
