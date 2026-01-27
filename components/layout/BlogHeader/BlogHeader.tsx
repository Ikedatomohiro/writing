"use client";

import { Box, Container, Flex, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { NavLink } from "./NavLink";
import { MobileMenu, type NavLinkItem } from "./MobileMenu";
import { SITE_CONFIG } from "@/lib/constants/site";

const NAV_LINKS: NavLinkItem[] = [
  { href: "/asset", label: "資産形成" },
  { href: "/tech", label: "プログラミング" },
  { href: "/health", label: "健康" },
];

export function BlogHeader() {
  return (
    <Box
      as="header"
      bg="var(--bg-card)"
      borderBottomWidth="1px"
      borderColor="var(--border)"
      data-component="blog-header"
    >
      <Container maxW="1280px" px={{ base: 4, md: 6 }}>
        <Flex
          justify="space-between"
          align="center"
          h={{ base: "56px", md: "64px" }}
        >
          {/* Logo / Site Name */}
          <NextLink href="/">
            <Text
              fontWeight="bold"
              fontSize={{ base: "lg", md: "xl" }}
              color="var(--accent)"
              _hover={{ opacity: 0.8 }}
            >
              {SITE_CONFIG.name}
            </Text>
          </NextLink>

          {/* Desktop Navigation */}
          <Flex
            as="nav"
            gap={1}
            display={{ base: "none", md: "flex" }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </Flex>

          {/* Mobile Menu */}
          <Box display={{ base: "block", md: "none" }}>
            <MobileMenu links={NAV_LINKS} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
