import { StepRenderer } from "@web/components/step_renderer";
import { toolBarEvents } from "@web/components/tool_bar/events";
import { Steps } from "@web/interfaces";
import { useEffect, useState } from "react";

const RendererContent: React.FC = () => {
  const [steps, setSteps] = useState<Steps>();

  useEffect(() => {
    toolBarEvents.on("select-steps", (steps) => {
      setSteps(steps);
    });
  }, []);

  return <StepRenderer steps={steps} />;
};

export default RendererContent;
