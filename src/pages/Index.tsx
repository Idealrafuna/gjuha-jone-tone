import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-tirana.jpg";
import { ProgressStreak } from "@/components/ProgressStreak";
import AvatarGuide from "@/components/AvatarGuide";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react'
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
    useEffect(() => { testSupabase() }, [])

  const [featuredLessons, setFeaturedLessons] = useState<{ slug: string; title: string; summary: string; cover_image_url: string | null }[] | null>(null);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);
  useEffect(() => {
    const fetchFeatured = async () => {
      const client = supabase as any;
      const { data, error } = await client
        .from('lessons')
        .select('slug, title, summary, cover_image_url')
        .eq('published', true)
        .order('title', { ascending: true })
        .limit(4);
      if (error) setLessonsError(error.message);
      else setFeaturedLessons(data);
    };
    fetchFeatured();
  }, [])

  return (
    <main>
      <Seo
        title="BeAlbanian – Learn Albanian, feel Albanian"
        description="Learn Albanian (Gheg & Tosk) with lessons, culture, quizzes, and progress tracking."
        canonical="/"
      />
      <section className="relative overflow-hidden rounded-2xl border">
        <img src={heroImage} alt="Skanderbeg Square in Tirana with the Skanderbeg statue" className="w-full h-[42vh] md:h-[56vh] object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
        
        {/* Avatar Welcome */}
        {userName && (
          <div className="absolute top-4 left-4 z-10">
            <AvatarGuide 
              emotion="wave"
              size="lg"
              showSpeechBubble={true}
              speechText={`Përshëndetje, ${userName}! Ready to continue learning?`}
            />
          </div>
        )}
        
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
              <Link to="/cities"><Button variant="secondary" size="lg">Cities</Button></Link>
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

      {featuredLessons === null && !lessonsError && (
        <section className="container mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-4">Featured Lessons</h2>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </section>
      )}

      {lessonsError && (
        <section className="container mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-4">Featured Lessons</h2>
          <p className="text-sm text-destructive">Error: {lessonsError}</p>
        </section>
      )}

      {featuredLessons && featuredLessons.length > 0 && (
        <section className="container mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-4">Featured Lessons</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredLessons.map((l) => (
              <Card key={l.slug}>
                <CardContent className="p-0">
                  <img
                    src={l.cover_image_url || '/placeholder.svg'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
                    alt={`${l.title} cover image`}
                    loading="lazy"
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{l.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{l.summary}</p>
                    <div className="mt-3">
                      <Link to={`/lessons/${l.slug}`} className="text-sm underline">Open lesson</Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/learn" className="underline">View all lessons</Link>
          </div>
        </section>
      )}

    </main>
  );
};

export default Index;
