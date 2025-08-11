import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { DialectToggle, Dialect } from "@/components/DialectToggle";
import { useState } from "react";

const Settings = () => {
  const [dialect, setDialect] = useState<Dialect>("tosk");
  return (
    <main className="container mx-auto py-10">
      <Seo title="Settings – Profile" description="Profile, dialect, notifications, delete account." canonical="/settings" />
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Dialect</h3>
          <DialectToggle value={dialect} onChange={setDialect} />
        </CardContent>
      </Card>
    </main>
  );
};

export default Settings;
