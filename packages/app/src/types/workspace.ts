export interface Workspace {
  id: string;
  projectId: string;
  directory: string;
  name: string;
  branch: string | null;
  remoteUrl: string | null;
  isWorktree: boolean;
  additions: number;
  deletions: number;
}

export interface PullRequestRef {
  number: number | null;
  merged: boolean;
}
