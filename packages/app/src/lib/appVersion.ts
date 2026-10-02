export interface VersionLabel {
  text: string;
  title: string;
}

export function versionLabel(version: string, build: string): VersionLabel {
  return {
    text: `v${version}`,
    title:
      build === "dev"
        ? `Interlock ${version}, development build`
        : `Interlock ${version}, build ${build}`,
  };
}

export const appVersion = versionLabel(__APP_VERSION__, __APP_BUILD__);
