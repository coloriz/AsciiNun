import * as toml from "@iarna/toml";
import { CLIError } from "@oclif/errors";
import * as yaml from "js-yaml";

import * as metadecoders from "./metadecoders";

const yamlDelimLf = "---\n";
const tomlDelimLf = "+++\n";

export const objectToConfig = (
  obj: toml.JsonMap,
  format: metadecoders.Format
): string => {
  switch (format) {
    case metadecoders.YAML:
      return yaml.dump(obj);
    case metadecoders.TOML:
      return toml.stringify(obj);
    case metadecoders.JSON:
      return JSON.stringify(obj, null, 4) + "\n";
  }

  throw new CLIError("unsupported Format provided");
};
