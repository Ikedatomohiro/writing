import { Box } from "@chakra-ui/react";
import { COLORS } from "@/lib/theme/colors";

interface ContactFormProps {
  formUrl: string;
}

export function ContactForm({ formUrl }: ContactFormProps) {
  if (!formUrl) {
    return (
      <Box
        bg={COLORS.bgCard}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={COLORS.border}
        p={8}
        textAlign="center"
        color={COLORS.textMuted}
      >
        フォームを読み込んでいます...
      </Box>
    );
  }

  return (
    <Box
      bg={COLORS.bgCard}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={COLORS.border}
      overflow="hidden"
      p={4}
    >
      <iframe
        src={formUrl}
        title="お問い合わせフォーム"
        style={{
          width: "100%",
          height: "800px",
          border: "none",
        }}
      />
    </Box>
  );
}
