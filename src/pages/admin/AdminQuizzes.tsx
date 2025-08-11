import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const AdminQuizzes = () => (
  <main className="container mx-auto py-10">
    <Seo title="Admin – Quizzes" description="CRUD for quizzes." canonical="/admin/quizzes" />
    <h1 className="text-3xl font-bold mb-4">Admin – Quizzes</h1>
    <Card><CardContent className="p-6">List and form placeholders</CardContent></Card>
  </main>
);

export default AdminQuizzes;
