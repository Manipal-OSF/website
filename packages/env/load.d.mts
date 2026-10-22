export const workspaceRoot: string;
export function loadRootEnv(
  mode: 'development' | 'production' | 'test',
  directory?: string,
): { combinedEnv: NodeJS.ProcessEnv };
