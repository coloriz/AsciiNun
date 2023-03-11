import * as path from "node:path";

const contentFileExtensions = new Set([".asciidoc", ".adoc", ".asc"]);

export const isContentFile = (filename: string): boolean => {
  return contentFileExtensions.has(path.extname(filename));
};
