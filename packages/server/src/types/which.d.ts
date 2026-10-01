declare module "which" {
  function which(command: string, options: { all: true }): Promise<string[]>;
  export default which;
}
