import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminCities = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Cities" description="CRUD for cities." canonical="/admin/cities" />
    <h1 className="text-3xl font-bold mb-4">Admin – Cities</h1>
    <Card><CardContent className="p-6">List and form placeholders</CardContent></Card>
  </main>
);

export default AdminCities;
