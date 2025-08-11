import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminHome = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Overview" description="Admin overview." canonical="/admin" />
    <h1 className="text-3xl font-bold mb-4">Admin</h1>
    <div className="grid md:grid-cols-3 gap-4">
      <Card><CardContent className="p-6">Lessons: 12</CardContent></Card>
      <Card><CardContent className="p-6">Cities: 14</CardContent></Card>
      <Card><CardContent className="p-6">Figures: 18</CardContent></Card>
    </div>
  </main>
);

export default AdminHome;
