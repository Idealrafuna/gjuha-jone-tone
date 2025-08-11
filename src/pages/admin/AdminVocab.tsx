import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminVocab = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Vocab" description="CRUD for vocabulary." canonical="/admin/vocab" />
    <h1 className="text-3xl font-bold mb-4">Admin – Vocab</h1>
    <Card><CardContent className="p-6">List and form placeholders</CardContent></Card>
  </main>
);

export default AdminVocab;
