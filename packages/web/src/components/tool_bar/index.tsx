import { Box, Stack, Text } from "@chakra-ui/react";
import { store } from "@web/store";
import { Button } from "../ui/button";
import { toolBarEvents } from "./events";
import { useEffect, useState } from "react";

const ToolBar: React.FC = () => {
  return (
    <Stack
      pos="absolute"
      top={0}
      left={0}
      p={2}
      borderWidth={1}
      rounded="md"
      bg="white"
      zIndex={1000}
    >
      <CurrentStepDisplay />
      <Button onClick={() => toolBarEvents.emit("open-steps-selector")}>
        选择展开
      </Button>
      <Button onClick={() => toolBarEvents.emit("back-to-origin")}>
        返回原点
      </Button>
    </Stack>
  );
};

const CurrentStepDisplay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(store.getCurrentSteps());

  useEffect(() => {
    toolBarEvents.on("select-steps", (steps) => {
      setCurrentStep(steps);
    });
  }, []);

  return (
    <Box>
      {currentStep ? (
        <Text>当前展开: {currentStep.name}</Text>
      ) : (
        <Text>尚未选择展开</Text>
      )}
    </Box>
  );
};

export default ToolBar;
