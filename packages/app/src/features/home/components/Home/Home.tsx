import { motion } from "motion/react";
import { MainBar } from "@/components/layout/MainBar/MainBar";
import { fadeIn, spring } from "@/lib/motion";
import { HomeComposer } from "./HomeComposer/HomeComposer";
import { ModelPicker } from "./ModelPicker/ModelPicker";
import { StartInRepository } from "./StartInRepository/StartInRepository";
import { TaskFlowCard } from "./TaskFlowCard/TaskFlowCard";
import { useHome } from "./useHome";
import { WaitingOnYou } from "./WaitingOnYou/WaitingOnYou";

const arrive = (delay: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn, delay } },
});

export function Home() {
  const { target, choice, setChoice, hasProjects, setup } = useHome();

  return (
    <div className="flex h-full flex-col">
      <MainBar left={<ModelPicker value={choice} onChange={setChoice} />} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[720px] flex-col px-6 pt-[15vh] pb-20">
          <motion.h1
            {...(hasProjects ? {} : arrive(0))}
            className="text-center font-serif text-[34px] leading-tight tracking-[-0.01em] text-ink"
          >
            What should we build?
          </motion.h1>
          <HomeComposer choice={choice} target={target} setup={setup} />
          {hasProjects ? (
            <WaitingOnYou />
          ) : (
            <motion.div {...arrive(0.12)}>
              <StartInRepository adding={setup.adding} onAdd={setup.add} onPick={setup.pick} />
              <TaskFlowCard />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
