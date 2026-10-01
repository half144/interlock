import { Collapse } from "@/components/ui/Collapse/Collapse";
import { RepositoryRow } from "./RepositoryRow/RepositoryRow";
import { useRepositoryList } from "./useRepositoryList";

export function RepositoryList({
  adding,
  onAdd,
}: {
  adding: string | null;
  onAdd: (path: string) => void;
}) {
  const { rows } = useRepositoryList();

  return (
    <Collapse open={rows.length > 0}>
      <section className="pt-10">
        <h2 className="placard px-3">Repositories on this Mac</h2>
        <ul className="mt-2">
          {rows.map((row) => (
            <li key={row.path}>
              <RepositoryRow
                name={row.name}
                folder={row.folder}
                active={row.active}
                adding={adding === row.path}
                disabled={adding !== null}
                onAdd={() => onAdd(row.path)}
              />
            </li>
          ))}
        </ul>
      </section>
    </Collapse>
  );
}
