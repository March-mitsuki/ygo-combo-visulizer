import { Box, Stack, Text } from "@chakra-ui/react";
import { store } from "@web/store";
import { Button } from "../ui/button";
import { toolBarEvents } from "./events";
import { useEffect, useState } from "react";
import { stepsClient } from "@web/httpclient/models";
import { toaster } from "../ui/toaster";

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
      <SaveBtn />
    </Stack>
  );
};

const SaveBtn: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(store.getCurrentSteps());

  useEffect(() => {
    toolBarEvents.on("select-steps", (steps) => {
      setCurrentStep(steps);
    });
  }, []);

  return (
    <Button
      disabled={!currentStep}
      onClick={() => {
        if (!currentStep) return;
        stepsClient
          .update(currentStep.id, currentStep.toSaveJSON())
          .then((res) => {
            if (res.code.toString().startsWith("2")) {
              toaster.success({ title: "已保存到服务器" });
            } else {
              toaster.error({
                title: "保存到服务器失败",
                description: res.code,
              });
            }
          })
          .catch((e) => {
            toaster.error({ title: "请求出错" });
            console.error("请求出错", e);
          });
      }}
    >
      保存当前展开
    </Button>
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
