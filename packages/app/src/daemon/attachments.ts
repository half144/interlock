import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import type { AgentAttachment } from "@interlock/protocol/messages";
import { isImageFile, toBase64 } from "@/lib/attachments";

interface PromptAttachments {
  images: { data: string; mimeType: string }[];
  attachments: AgentAttachment[];
}

/** Images go to the model as image input; every other file is uploaded to the daemon and referenced by its path. */
export async function toPromptAttachments(
  client: DaemonClient,
  files: File[],
): Promise<PromptAttachments> {
  const images = await Promise.all(
    files.filter(isImageFile).map(async (file) => ({
      data: toBase64(new Uint8Array(await file.arrayBuffer())),
      mimeType: file.type,
    })),
  );
  const attachments = await Promise.all(
    files
      .filter((file) => !isImageFile(file))
      .map(async (file) => {
        const result = await client.uploadFile({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          bytes: await file.arrayBuffer(),
        });
        if (result.error || !result.file) {
          throw new Error(result.error ?? `The daemon did not accept ${file.name}.`);
        }
        return result.file;
      }),
  );
  return { images, attachments };
}

export const withPromptAttachments = ({ images, attachments }: PromptAttachments) => ({
  ...(images.length > 0 ? { images } : {}),
  ...(attachments.length > 0 ? { attachments } : {}),
});
