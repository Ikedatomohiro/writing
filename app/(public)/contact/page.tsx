import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { COLORS } from "@/lib/theme/colors";
import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  const formUrl = process.env.NEXT_PUBLIC_CONTACT_FORM_URL || "";

  return (
    <Box as="main" bg={COLORS.bgPrimary} minH="100vh" py={12}>
      <Container maxW="container.md">
        <VStack gap={8} align="stretch">
          <VStack gap={4} align="center">
            <Heading
              as="h1"
              size="2xl"
              color={COLORS.textPrimary}
              fontFamily="Noto Sans JP"
            >
              お問い合わせ
            </Heading>
            <Text
              color={COLORS.textSecondary}
              textAlign="center"
              fontFamily="Noto Sans JP"
            >
              ご質問やご要望がございましたら、下記フォームよりお気軽にお問い合わせください。
            </Text>
          </VStack>

          <ContactForm formUrl={formUrl} />
        </VStack>
      </Container>
    </Box>
  );
}
