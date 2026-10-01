import { useState } from "react";
import { defaultModel } from "@/lib/agentKinds";
import { MainBar } from "@/components/layout/MainBar/MainBar";
import { HomeComposer } from "./HomeComposer/HomeComposer";
import type { ModelChoice } from "@/features/home/types";
import { ModelPicker } from "./ModelPicker/ModelPicker";
import { WaitingOnYou } from "./WaitingOnYou/WaitingOnYou";

export function Home() {
  const [choice, setChoice] = useState<ModelChoice>({
    kind: "claude",
    model: defaultModel("claude"),
  });

  return (
    <div className="flex h-full flex-col">
      <MainBar left={<ModelPicker value={choice} onChange={setChoice} />} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[720px] flex-col px-6 pt-[15vh] pb-20">
          <h1 className="text-center font-serif text-[34px] leading-tight tracking-[-0.01em] text-ink">
            What should we build?
          </h1>
          <HomeComposer choice={choice} />
          <WaitingOnYou />
        </div>
      </div>
    </div>
  );
}
