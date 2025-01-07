import { Box, Link as CLink } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const Nav: React.FC = () => {
  return (
    <Box
      as="nav"
      bg="gray.200"
      pos="fixed"
      w="full"
      px="2rem"
      h="48px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      zIndex="sticky"
    >
      <CLink asChild>
        <Link to="/">QupidJS - Admin</Link>
      </CLink>
    </Box>
  );
};
