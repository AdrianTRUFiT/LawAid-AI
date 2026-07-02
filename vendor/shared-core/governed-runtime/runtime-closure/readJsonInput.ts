import * as fs from "node:fs";

function stripBom(value: string): string {
  return value.replace(/^\uFEFF/, "");
}

export function readJsonInput(rawArg: string | undefined): string {
  const arg = rawArg?.trim() ?? "";

  if (arg.length > 0) {
    if (arg.startsWith("@")) {
      const filePath = arg.slice(1);
      return stripBom(fs.readFileSync(filePath, "utf8"));
    }

    return stripBom(arg);
  }

  const stdin = stripBom(fs.readFileSync(0, "utf8")).trim();
  if (stdin.length > 0) {
    return stdin;
  }

  throw new Error("json_input_required");
}
