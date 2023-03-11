import * as path from "node:path";

import { CLIError } from "@oclif/errors";
import * as fs from "fs-extra";

import * as helpers from "@/helpers";
import * as files from "@/lib/files";

export const defaultArchetypeTemplate = `---
date: {{ date }}
draft: true
---
= {{ name | title }}

`;
export const defaultSectionArchetypeTemplate = `---
date: {{ date }}
draft: true
---
= {{ name | title }}

:leveloffset: +1

{{ for page in pages }}
include::{{ page }}[]

<<<
{{ endfor }}

:leveloffset: -1
`;
export const defaultSectionRootArchetypeTemplate = `---
date: {{ date }}
draft: true
titlePage: true
---
= {{ name | title }}
{{ author }}
{{ revision }}
:toc: macro
:sectnums:

:leveloffset: +1

{{ for page in pages }}
include::{{ page }}[]

<<<
{{ endfor }}

:leveloffset: -1
`;

export const newContent = async (
  kind: string,
  targetPath: string,
  force: boolean
): Promise<void> => {
  if (path.isAbsolute(targetPath)) {
    throw new CLIError(`absolute path is not allowed: "${targetPath}"`);
  }

  targetPath = helpers.toSlashTrim(path.normalize(targetPath));
  let ext = path.extname(targetPath);
  if (ext === "") {
    ext = ".adoc";
    targetPath = path.join(targetPath, "_index.adoc");
  }

  if (!files.isContentFile(targetPath)) {
    throw new CLIError(
      `target path "${targetPath}" is not a known content format`
    );
  }

  const parsedPath = path.parse(targetPath);
  const dirParts = parsedPath.dir.split("/");

  if (kind === "") {
    if (parsedPath.name === "_index") {
      kind = "section";
      if (dirParts.length === 1) {
        kind = "section-root";
      }
    } else if (dirParts.length >= 1) {
      kind = dirParts[0];
    }
  }

  const archetypeFilename = await findArchetype(kind, ext);

  let archetypeTemplate: string;

  if (archetypeFilename === "") {
    archetypeTemplate = defaultArchetypeTemplate;
  } else {
    archetypeTemplate = await fs.readFile(archetypeFilename, {
      encoding: "utf8",
    });
  }

  const targetFilename = path.resolve(path.join("content", targetPath));

  if (force) {
    await fs.outputFile(targetFilename, archetypeTemplate);
  } else {
    await helpers.safeOutputFile(targetFilename, archetypeTemplate);
  }

  console.log(`Content "${targetFilename}" created`);
};

const findArchetype = async (kind: string, ext: string): Promise<string> => {
  const pathsToCheck: string[] = [];

  if (kind !== "") {
    pathsToCheck.push(kind + ext);
  }

  pathsToCheck.push("default" + ext);

  for (const p of pathsToCheck.map((f) => path.join("archetypes", f))) {
    if (await helpers.isFile(p)) {
      return p;
    }
  }

  return "";
};
