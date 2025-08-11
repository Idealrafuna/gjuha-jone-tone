import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => (
  <main className="container mx-auto py-10">
    <Seo title="Dashboard – Your progress" description="XP, streak, last quizzes, and saved items." canonical="/dashboard" />
    <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
    <div className="grid md:grid-cols-3 gap-4">
      <Card><CardContent className="p-6">XP: 120</CardContent></Card>
      <Card><CardContent className="p-6">Streak: 5 days</CardContent></Card>
      <Card><CardContent className="p-6">Saved items: 3</CardContent></Card>
    </div>
  </main>
);

export default Dashboard;
