export const isImageFile = (file: Pick<File, "type">) => file.type.startsWith("image/");

const CHUNK = 0x8000;

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export const sizeLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** A pasted screenshot arrives as an unnamed "image.png"; give each a name that tells them apart. */
export function pastedName(file: Pick<File, "name" | "type">, index: number): string {
  if (file.name && file.name !== "image.png") return file.name;
  const extension = file.type.split("/")[1] ?? "png";
  return `pasted-image-${index + 1}.${extension}`;
}

export const pastedFiles = (files: File[]): File[] =>
  files.map((file, i) => {
    const name = pastedName(file, i);
    return name === file.name ? file : new File([file], name, { type: file.type });
  });
