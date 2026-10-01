export interface Project {
  id: string;
  /** Prefix of the project's task ids, as in CHK-41. */
  key: string;
  name: string;
  repo: string;
  defaultBranch: string;
  stack: string;
  setupScript: string;
  runScript: string;
  port: number;
  mcp: string[];
  skills: string[];
  budget: number;
}
