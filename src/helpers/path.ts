import { PathLike, Stats } from "node:fs";

import { CLIError } from "@oclif/errors";
import * as fs from "fs-extra";

export const isDir = async (p: PathLike): Promise<boolean> => {
  let stats: Stats;

  try {
    stats = await fs.stat(p);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  return stats.isDirectory();
};

export const isFile = async (p: PathLike): Promise<boolean> => {
  let stats: Stats;

  try {
    stats = await fs.stat(p);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  return stats.isFile();
};

export const isEmpty = async (p: PathLike): Promise<boolean> => {
  return (await fs.readdir(p)).length == 0;
};

export const exists = async (p: PathLike): Promise<boolean> => {
  try {
    await fs.access(p);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return false;
    }
    throw error;
  }
  return true;
};

export const toSlashTrim = (s: string): string => {
  return s.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
};

export const safeOutputFile = async (
  p: string,
  data: string | NodeJS.ArrayBufferView
): Promise<void> => {
  try {
    await fs.outputFile(p, data, { flag: "wx" });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EEXIST") {
      throw new CLIError(`${p} already exists`);
    }
    throw error;
  }
};
