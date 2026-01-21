"use client";

import { signIn } from "next-auth/react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

type Props = {
  error?: string;
};

export function LoginForm({ error }: Props) {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/articles" });
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "AccessDenied":
        return "アクセスが拒否されました。許可されたアカウントでログインしてください。";
      case "Configuration":
        return "認証設定にエラーがあります。管理者にお問い合わせください。";
      default:
        return "ログインに失敗しました。もう一度お試しください。";
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg="gray.50"
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="md"
        maxW="400px"
        w="full"
      >
        <VStack gap={6}>
          <Heading size="lg">管理画面ログイン</Heading>

          {error && (
            <Box
              bg="red.50"
              border="1px"
              borderColor="red.200"
              borderRadius="md"
              p={4}
              w="full"
            >
              <Text color="red.600" fontSize="sm">
                {getErrorMessage(error)}
              </Text>
            </Box>
          )}

          <Button
            colorPalette="blue"
            size="lg"
            w="full"
            onClick={handleGoogleSignIn}
          >
            Googleでログイン
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
