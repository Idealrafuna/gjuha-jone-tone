import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminLessons = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Lessons" description="CRUD for lessons." canonical="/admin/lessons" />
    <h1 className="text-3xl font-bold mb-4">Admin – Lessons</h1>
    <Card><CardContent className="p-6">List and form placeholders</CardContent></Card>
  </main>
);

export default AdminLessons;
