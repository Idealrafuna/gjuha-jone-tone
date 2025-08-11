import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminTraditions = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Traditions" description="CRUD for traditions." canonical="/admin/traditions" />
    <h1 className="text-3xl font-bold mb-4">Admin – Traditions</h1>
    <Card><CardContent className="p-6">List and form placeholders</CardContent></Card>
  </main>
);

export default AdminTraditions;
