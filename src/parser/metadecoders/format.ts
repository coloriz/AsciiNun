import * as path from "node:path";

export type Format = string;

export const JSON: Format = "json";
export const TOML: Format = "toml";
export const YAML: Format = "yaml";

export const formatFromString = (formatStr: string): Format => {
  formatStr = formatStr.toLowerCase();
  if (formatStr.includes(".")) {
    // Assume a filename
    formatStr = path.extname(formatStr).replace(/^\./, "");
  }

  switch (formatStr) {
    case "yaml":
    case "yml":
      return YAML;
    case "json":
      return JSON;
    case "toml":
      return TOML;
  }

  return "";
};
