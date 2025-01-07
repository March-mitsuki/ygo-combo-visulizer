import { Link } from "react-router-dom";
import { Link as CLink, Heading, Text } from "@chakra-ui/react";

export const NotFound: React.FC = () => {
  return (
    <>
      <Heading>404</Heading>
      <Text>Page not found</Text>
      <CLink asChild>
        <Link to="/">Go back to home</Link>
      </CLink>
    </>
  );
};
