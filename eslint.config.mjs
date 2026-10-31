import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint flat config.
 *
 * eslint-config-next 16 ships native flat-config arrays, so they are spread
 * directly. The legacy FlatCompat bridge is not used (and is incompatible here).
 */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "public/**", "reference-data/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...nextTypescript,
  {
    // Brief 11: the compatibility engine must stay independent of React.
    // Enforced mechanically rather than by good intentions.
    files: ["lib/compatibility/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "lib/compatibility must stay React-free (brief 11)." },
            { name: "react-dom", message: "lib/compatibility must stay React-free (brief 11)." },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
