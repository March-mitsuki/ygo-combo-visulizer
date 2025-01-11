import { AbsoluteCenter, Box, HStack, Stack, Text } from "@chakra-ui/react";
import { store } from "@web/store";
import { Button } from "@web/components/ui/button";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@web/components/ui/drawer";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@web/components/ui/accordion";
import { useEffect, useState } from "react";
import { toolBarEvents } from "../events";
import { CardDeck } from "@web/interfaces";

const StepsSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    toolBarEvents.on("open-steps-selector", () => {
      setIsOpen(true);
    });
  }, []);

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerCloseTrigger />
        <DrawerHeader>
          <DrawerTitle>所有展开</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Button
            mb={4}
            w="full"
            onClick={() => toolBarEvents.emit("req-add-card-deck")}
          >
            添加构筑
          </Button>
          <Body />
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
};

const Body: React.FC = () => {
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => {
    setRefresh((prev) => {
      if (prev > 100) {
        return 0;
      }
      return prev + 1;
    });
  };
  useEffect(() => {
    toolBarEvents.on("add-card-deck-done", triggerRefresh);
    toolBarEvents.on("add-final-field-done", triggerRefresh);
  }, []);

  return (
    <AccordionRoot collapsible>
      {store.deckList.map((deck) => (
        <AccordionItem key={deck.id + refresh} value={deck.name}>
          <Box pos="relative">
            <AccordionItemTrigger indicatorPlacement="start">
              {deck.name}
            </AccordionItemTrigger>
            <AbsoluteCenter axis="vertical" insetEnd="2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => toolBarEvents.emit("req-add-final-field", deck)}
              >
                添加终场
              </Button>
            </AbsoluteCenter>
          </Box>
          <AccordionItemContent>
            <StepsBody deck={deck} />
          </AccordionItemContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
};

const StepsBody: React.FC<{
  deck: CardDeck;
}> = ({ deck }) => {
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => {
    setRefresh((prev) => {
      if (prev > 100) {
        return 0;
      }
      return prev + 1;
    });
  };
  useEffect(() => {
    toolBarEvents.on("add-steps-done", triggerRefresh);
  }, []);

  return (
    <AccordionRoot collapsible variant="subtle">
      {store.getDeckFinalFields(deck.id).map((finalField) => (
        <AccordionItem key={finalField.id + refresh} value={finalField.name}>
          <Box position="relative">
            <AccordionItemTrigger indicatorPlacement="start">
              {finalField.name}
            </AccordionItemTrigger>
            <AbsoluteCenter axis="vertical" insetEnd="2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => toolBarEvents.emit("req-add-steps", finalField)}
              >
                添加展开
              </Button>
            </AbsoluteCenter>
          </Box>
          <AccordionItemContent>
            <Stack>
              {store.getFinalFieldSteps(finalField.id).map((steps) => {
                return (
                  <HStack
                    key={steps.id + refresh}
                    borderWidth={1}
                    rounded="md"
                    p={1}
                  >
                    <Text flex={1} textAlign="center">
                      {steps.name}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => {
                        store.setCurrentStepsId(steps.id);
                        toolBarEvents.emit("select-steps", steps);
                      }}
                    >
                      选择
                    </Button>
                  </HStack>
                );
              })}
            </Stack>
          </AccordionItemContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
};

export default StepsSelector;
