import { useState } from "react";
import { agentKindList, agentKindOptions, agentKinds, defaultModel } from "@/lib/agentKinds";
import type { AgentKind } from "@/types";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { Toggle } from "@/components/ui/Toggle/Toggle";
import { optionsOf } from "@/lib/options";
import { Picker } from "@/components/ui/Picker/Picker";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

type Permission = "ask" | "edit" | "full";

const PERMISSIONS: { value: Permission; label: string }[] = [
  { value: "ask", label: "Ask" },
  { value: "edit", label: "Auto-edit" },
  { value: "full", label: "Full auto" },
];

const permissionText: Record<Permission, string> = {
  ask: "Agents ask before every edit and command. Slowest, safest.",
  edit: "Agents edit files freely and ask before shell commands outside the allowlist.",
  full: "Agents edit and run commands without asking. Worktrees are isolated, the network is not.",
};

export function AgentsSection() {
  const [kind, setKind] = useState<AgentKind>("claude");
  const [model, setModel] = useState(defaultModel("claude"));
  const [allowed, setAllowed] = useState<Record<AgentKind, boolean>>({
    claude: true,
    codex: true,
    gemini: false,
  });
  const [permission, setPermission] = useState<Permission>("edit");

  return (
    <Section
      id="agents"
      title="Agents"
      description="Which agents can work on this project, and how much they can do before stopping for you."
    >
      <Row label="Default agent" hint="Preselected in New task and in the chat composer.">
        <div className="w-40">
          <Picker
            label="Default agent"
            value={kind}
            options={agentKindOptions}
            onChange={(k) => {
              setKind(k);
              setModel(defaultModel(k));
            }}
          />
        </div>
        <div className="w-40">
          <Picker
            label="Default model"
            value={model}
            options={optionsOf(agentKinds[kind].models)}
            onChange={setModel}
          />
        </div>
      </Row>
      {agentKindList.map((k) => (
        <Row
          key={k}
          label={
            <span className="flex items-center gap-2.5">
              <AgentMark kind={k} />
              {agentKinds[k].label}
            </span>
          }
          hint={agentKinds[k].models.join(", ")}
        >
          <Toggle
            label={`Allow ${agentKinds[k].label}`}
            checked={allowed[k]}
            onChange={(v) => setAllowed((a) => ({ ...a, [k]: v }))}
          />
        </Row>
      ))}
      <Row label="Permission mode" hint={permissionText[permission]}>
        <Tabs value={permission} onChange={setPermission} items={PERMISSIONS} />
      </Row>
    </Section>
  );
}
