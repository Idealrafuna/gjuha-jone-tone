import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminFigures = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Figures" description="CRUD for figures." canonical="/admin/figures" />
    <h1 className="text-3xl font-bold mb-4">Admin – Figures</h1>
    <Card><CardContent className="p-6">List and form placeholders</CardContent></Card>
  </main>
);

export default AdminFigures;
