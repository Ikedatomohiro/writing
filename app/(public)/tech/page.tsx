import { Container, Heading, Text } from "@chakra-ui/react";

export default function TechPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={4}>
        エンジニア
      </Heading>
      <Text color="gray.600">
        エンジニアリングに関する記事を掲載しています。
      </Text>
    </Container>
  );
}
