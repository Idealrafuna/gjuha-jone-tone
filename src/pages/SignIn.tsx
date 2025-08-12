import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SignIn = () => (
  <main className="container mx-auto py-10">
    <Seo title="Sign in – BeAlbanian" description="Sign in with magic link or OAuth." canonical="/sign-in" />
    <h1 className="text-3xl font-bold mb-4">Sign in</h1>
    <Card>
      <CardContent className="p-6 grid gap-3">
        <Button variant="hero">Continue with Email (magic link)</Button>
        <Button variant="outline">Continue with Google</Button>
        <Button variant="outline">Continue with GitHub</Button>
        <p className="text-xs text-muted-foreground">Supabase auth will be enabled after you connect it.</p>
      </CardContent>
    </Card>
  </main>
);

export default SignIn;
