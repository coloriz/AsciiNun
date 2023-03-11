import * as path from "node:path";

import { Args, Command, Flags } from "@oclif/core";
import { CLIError } from "@oclif/errors";
import * as fs from "fs-extra";

import * as create from "@/create";
import * as helpers from "@/helpers";
import * as parser from "@/parser";
import * as metadecoders from "@/parser/metadecoders";

export default class NewSiteCommand extends Command {
  static summary = "Create a new site (skeleton)";

  static description = `
Create a new site in the provided directory.
The new site will have the correct structure, but no content or theme yet.
Use \`asciinun new [contentPath]\` to create new content.`;

  static flags = {
    format: Flags.string({
      char: "f",
      default: "toml",
      description: "config file format",
    }),
    force: Flags.boolean({
      default: false,
      description: "init inside non-empty directory",
    }),
  };

  static args = {
    path: Args.string({ required: true }),
  };

  async run(): Promise<void> {
    const { flags, args } = await this.parse(NewSiteCommand);

    const createpath = path.resolve(path.normalize(args.path));
    const configFormat = flags.format;
    const forceNew = flags.force;

    await doNewSite(createpath, configFormat, forceNew);
  }
}

const doNewSite = async (
  basepath: string,
  configFormat: string,
  force: boolean
) => {
  const archetypePath = path.join(basepath, "archetypes");
  const configPath = path.join(basepath, `config.${configFormat}`);
  const dirs = [
    archetypePath,
    path.join(basepath, "content"),
    path.join(basepath, "data"),
    path.join(basepath, "layouts"),
    path.join(basepath, "static"),
    path.join(basepath, "themes"),
  ];

  if (await helpers.exists(basepath)) {
    if (!(await helpers.isDir(basepath))) {
      throw new CLIError(`${basepath} already exists but not a directory`);
    }

    const isEmpty = await helpers.isEmpty(basepath);

    if (!isEmpty && !force) {
      throw new CLIError(
        `${basepath} already exists and is not empty. See --force.`
      );
    } else if (!isEmpty && force) {
      const all = [...dirs, configPath];
      for (const path of all) {
        if (await helpers.exists(path)) {
          throw new CLIError(`${path} already exists`);
        }
      }
    }
  }

  await Promise.all(dirs.map((dir) => fs.mkdir(dir, { recursive: true })));

  // Create a config file.
  const config = {
    baseURL: "http://example.org/",
    title: "My New AsciiNun Site",
    languageCode: "en-US",
  };

  await fs.outputFile(
    configPath,
    parser.objectToConfig(config, metadecoders.formatFromString(configFormat))
  );

  // Create default archetype files.
  const archetypeFilenames: { filename: string; content: string }[] = [
    { filename: "default.adoc", content: create.defaultArchetypeTemplate },
    {
      filename: "section.adoc",
      content: create.defaultSectionArchetypeTemplate,
    },
    {
      filename: "section-root.adoc",
      content: create.defaultSectionRootArchetypeTemplate,
    },
  ];
  await Promise.all(
    archetypeFilenames.map(({ filename, content }) =>
      helpers.safeOutputFile(path.join(archetypePath, filename), content)
    )
  );

  console.log(
    `Congratulations! Your new AsciiNun site is created in ${basepath}.\n`
  );
};
