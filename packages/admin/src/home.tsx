import { models } from "@server/db/models";
import { Link } from "react-router-dom";
import { Link as CLink, Heading, Text, Stack, HStack } from "@chakra-ui/react";

export function Home() {
  return (
    <>
      <Heading>QupitJS Admin</Heading>
      <HStack>
        <Text fontWeight="bold">BaseUrl:</Text>
        <Text>{window.app.config.baseUrl}</Text>
      </HStack>

      <Stack mt="1rem" gap={1}>
        <Heading size="md">Models</Heading>
        {models.map((model) => (
          <CLink asChild key={model.name}>
            <Link to={model.modelRoutePrefix}>{model.name}</Link>
          </CLink>
        ))}
      </Stack>
    </>
  );
}
