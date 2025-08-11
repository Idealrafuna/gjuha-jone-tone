import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-albania.jpg";
import { ProgressStreak } from "@/components/ProgressStreak";
import { Link } from "react-router-dom";
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

async function testSupabase() {
  // Temporary types bypass until Supabase types are synced
  const client = supabase as any;
  const { data, error } = await client
    .from('lessons')
    .select('id, title')
    .limit(3);
  
  console.log("Supabase test →", { data, error });
}


const Index = () => {
    useEffect(() => {
    testSupabase()
  }, [])

  return (
    <main>
      <Seo
        title="Mësuesi i Shqipërisë – Learn Albanian, feel Albanian"
        description="Learn Albanian (Gheg & Tosk) with lessons, culture, quizzes, and progress tracking."
        canonical="/"
      />
      <section className="relative overflow-hidden rounded-2xl border">
        <img src={heroImage} alt="Albanian landscape hero image" className="w-full h-[42vh] md:h-[56vh] object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="container mx-auto p-6 md:p-10">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
              Learn Albanian, feel Albanian
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-3">
              Lessons, culture, and pride — with Gheg & Tosk side by side.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/onboarding"><Button variant="hero" size="lg">Pick your dialect</Button></Link>
              <Link to="/explore"><Button variant="outline" size="lg">Explore culture</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Gheg & Tosk</h3>
            <p className="text-sm text-muted-foreground">Toggle dialects in every lesson and see variants side by side.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Culture included</h3>
            <p className="text-sm text-muted-foreground">Cities, figures, and traditions to rekindle pride in heritage.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Progress & streaks</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Track your XP and keep the fire alive.</p>
              <ProgressStreak days={3} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Try a quick quiz</h3>
            <p className="text-sm text-muted-foreground mb-3">Sample questions from beginner lessons.</p>
            <ul className="text-sm list-disc pl-5 text-muted-foreground">
              <li>Greetings</li>
              <li>Family</li>
              <li>Food & Café</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Testimonials</h3>
            <p className="text-sm text-muted-foreground">“Finally a mentor that respects our dialects.”</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Index;
