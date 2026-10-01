import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  DEFAULT_PROJECT_SETTINGS,
  PROJECT_SETTINGS_VERSION,
  ProjectSettingsSchema,
  type ProjectSettings,
  type ProjectSettingsPatch,
} from "@interlock/protocol/project-settings-schema";
import { normalizePathForIdentity } from "../../utils/path.js";
import { writeJsonFileAtomic } from "../atomic-file.js";

const SETTINGS_FILE_NAME = "project-settings.json";

const SettingsFileSchema = z.object({
  version: z.literal(PROJECT_SETTINGS_VERSION),
  projects: z.record(z.string(), ProjectSettingsSchema.partial()),
});
type SettingsFile = z.infer<typeof SettingsFileSchema>;

export class ProjectSettingsFileError extends Error {
  constructor(filePath: string, detail: string) {
    super(
      `Project settings file ${filePath} is not readable (${detail}). Fix it or delete it to reset every project to defaults.`,
    );
    this.name = "ProjectSettingsFileError";
  }
}

const storesByFile = new Map<string, ProjectSettingsStore>();

export class ProjectSettingsStore {
  private writeQueue: Promise<unknown> = Promise.resolve();

  private constructor(private readonly filePath: string) {}

  /** One instance per file, so every caller shares the same write queue. */
  static forHome(paseoHome: string): ProjectSettingsStore {
    const filePath = path.join(paseoHome, SETTINGS_FILE_NAME);
    let store = storesByFile.get(filePath);
    if (!store) {
      store = new ProjectSettingsStore(filePath);
      storesByFile.set(filePath, store);
    }
    return store;
  }

  async get(projectRoot: string): Promise<ProjectSettings> {
    const file = await this.readFile();
    return mergeWithDefaults(file.projects[normalizePathForIdentity(projectRoot)]);
  }

  update(projectRoot: string, patch: ProjectSettingsPatch): Promise<ProjectSettings> {
    const run = async (): Promise<ProjectSettings> => {
      const file = await this.readFile();
      const key = normalizePathForIdentity(projectRoot);
      const next = ProjectSettingsSchema.parse({
        ...mergeWithDefaults(file.projects[key]),
        ...stripUndefined(patch),
      });
      file.projects[key] = next;
      await writeJsonFileAtomic(this.filePath, file);
      return next;
    };
    const result = this.writeQueue.then(run, run);
    this.writeQueue = result.catch(() => undefined);
    return result;
  }

  private async readFile(): Promise<SettingsFile> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { version: PROJECT_SETTINGS_VERSION, projects: {} };
      }
      throw new ProjectSettingsFileError(this.filePath, String(error));
    }
    try {
      return SettingsFileSchema.parse(JSON.parse(raw));
    } catch (error) {
      throw new ProjectSettingsFileError(
        this.filePath,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

function mergeWithDefaults(stored: Partial<ProjectSettings> | undefined): ProjectSettings {
  return { ...DEFAULT_PROJECT_SETTINGS, ...stripUndefined(stored ?? {}) };
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
