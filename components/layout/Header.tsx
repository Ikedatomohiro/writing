"use client";

import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Box as="header" bg="gray.100" borderBottomWidth="1px">
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" h="16">
          <Link href="/articles">
            <Text fontWeight="bold" fontSize="lg">
              記事管理システム
            </Text>
          </Link>
          {session?.user && (
            <Flex align="center" gap={4}>
              <Text fontSize="sm" color="gray.600">
                {session.user.email}
              </Text>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                ログアウト
              </Button>
            </Flex>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
