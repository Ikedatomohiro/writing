import { LoginForm } from "./LoginForm";

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = params.error;

  return <LoginForm error={error} />;
}
