import { Box, Container, Flex, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { COLORS } from "@/lib/theme/colors";

const CATEGORIES = [
  { label: "Investment", href: "/asset" },
  { label: "Programming", href: "/tech" },
  { label: "Health", href: "/health" },
] as const;

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      bg={COLORS.bgSurface}
      pt={12}
      pb={6}
      px={6}
      w="full"
    >
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap={8}
          mb={8}
        >
          {/* Brand Section */}
          <VStack align="start" gap={3} maxW="300px">
            <Text
              fontWeight="bold"
              fontSize="xl"
              color={COLORS.textPrimary}
              fontFamily="Noto Sans JP"
            >
              BlogName
            </Text>
            <Text
              fontSize="sm"
              color={COLORS.textSecondary}
              lineHeight={1.6}
              fontFamily="Noto Sans JP"
            >
              資産形成、プログラミング、健康に関する記事を発信しています。
            </Text>
          </VStack>

          {/* Links Section */}
          <Flex gap={12}>
            {/* Categories */}
            <VStack align="start" gap={3}>
              <Text
                fontWeight="semibold"
                fontSize="sm"
                color={COLORS.textPrimary}
                fontFamily="Inter"
              >
                Categories
              </Text>
              {CATEGORIES.map((category) => (
                <Link key={category.href} href={category.href} passHref>
                  <Text
                    as="span"
                    fontSize="sm"
                    color={COLORS.textSecondary}
                    fontFamily="Noto Sans JP"
                    _hover={{ color: COLORS.textPrimary }}
                    cursor="pointer"
                  >
                    {category.label}
                  </Text>
                </Link>
              ))}
            </VStack>

            {/* Other Links */}
            <VStack align="start" gap={3}>
              <Text
                fontWeight="semibold"
                fontSize="sm"
                color={COLORS.textPrimary}
                fontFamily="Inter"
              >
                Links
              </Text>
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} passHref>
                  <Text
                    as="span"
                    fontSize="sm"
                    color={COLORS.textSecondary}
                    fontFamily="Noto Sans JP"
                    _hover={{ color: COLORS.textPrimary }}
                    cursor="pointer"
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </VStack>
          </Flex>
        </Flex>

        {/* Copyright */}
        <Box
          borderTopWidth="1px"
          borderColor={COLORS.border}
          pt={4}
          textAlign="center"
        >
          <Text fontSize="xs" color={COLORS.textMuted} fontFamily="Inter">
            © {currentYear} BlogName. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
