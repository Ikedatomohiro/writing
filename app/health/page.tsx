import { Container, Heading, Text } from "@chakra-ui/react";

export default function HealthPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={4}>
        健康
      </Heading>
      <Text color="gray.600">
        健康に関する記事を掲載しています。
      </Text>
    </Container>
  );
}
