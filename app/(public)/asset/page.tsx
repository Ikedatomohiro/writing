import { Container, Heading, Text } from "@chakra-ui/react";

export default function AssetPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={4}>
        資産形成
      </Heading>
      <Text color="gray.600">
        資産形成に関する記事を掲載しています。
      </Text>
    </Container>
  );
}
