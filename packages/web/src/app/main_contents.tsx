import { Box } from "@chakra-ui/react";
import ToolBar from "@web/components/tool_bar";
import StepsSelector from "@web/components/tool_bar/steps_selector";
import RendererContent from "./rendereder_contents";

const MainContents: React.FC = () => {
  return (
    <Box pos="relative">
      <RendererContent />
      <ToolBar />
      <StepsSelector />
    </Box>
  );
};

export default MainContents;
