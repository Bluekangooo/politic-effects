import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { istVorhabenGueltig } from "../src/types/validation.js";
import type { VorhabenKatalog } from "../src/types/vorhaben.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(__dirname, "..", "schema");
const examplesDir = join(__dirname, "..", "data", "examples");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

for (const file of readdirSync(schemaDir).filter((f) => f.endsWith(".json"))) {
  const schema = JSON.parse(readFileSync(join(schemaDir, file), "utf-8"));
  ajv.addSchema(schema);
}

const validateKatalog = ajv.getSchema("https://politic-effects.dev/schema/vorhaben-katalog.json");
if (!validateKatalog) {
  console.error("Schema vorhaben-katalog.json nicht geladen.");
  process.exit(1);
}

let hasErrors = false;

for (const file of readdirSync(examplesDir).filter((f) => f.endsWith(".json"))) {
  const path = join(examplesDir, file);
  const data = JSON.parse(readFileSync(path, "utf-8")) as VorhabenKatalog;

  console.log(`\nValidiere ${file} …`);

  let fileOk = true;

  if (!validateKatalog(data)) {
    console.error("  JSON-Schema-Fehler:", validateKatalog.errors);
    fileOk = false;
  }

  for (const vorhaben of data.vorhaben) {
    if (!istVorhabenGueltig(vorhaben)) {
      console.error(`  Vorhaben "${vorhaben.id}" ist strukturell ungültig.`);
      fileOk = false;
    }
  }

  if (fileOk) {
    console.log("  ✓ OK");
  } else {
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log("\nAlle Beispiele gültig.");
