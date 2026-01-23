import { render } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export function renderWithChakra(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}
