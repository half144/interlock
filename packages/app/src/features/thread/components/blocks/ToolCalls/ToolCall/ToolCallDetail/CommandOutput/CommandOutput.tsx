export function CommandOutput({
  command,
  output,
}: {
  command: string;
  output?: string | undefined;
}) {
  return (
    <>
      <p className="px-3.5 break-all whitespace-pre-wrap text-ink">
        <span className="text-ink-4 select-none">$ </span>
        {command}
      </p>
      {output && <p className="mt-1.5 px-3.5 whitespace-pre text-ink-3">{output}</p>}
    </>
  );
}
