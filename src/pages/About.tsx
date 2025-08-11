import { Seo } from "@/components/Seo";

const About = () => (
  <main className="container mx-auto py-10">
    <Seo title="About – Mësuesi i Shqipërisë" description="Our mission and how we handle Albanian dialects." canonical="/about" />
    <h1 className="text-3xl font-bold mb-4">About this app</h1>
    <p className="text-muted-foreground">Our mission is to teach Albanian to the diaspora while honoring both Gheg and Tosk. We present variants side by side and keep culture at the core: cities, figures, and traditions.</p>
  </main>
);

export default About;
