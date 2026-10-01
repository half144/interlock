/** The branches to offer: git's own list, with the current default kept in it even if git no longer lists it. */
export const withCurrent = (branches: string[], current: string) =>
  branches.includes(current) ? branches : [current, ...branches];
