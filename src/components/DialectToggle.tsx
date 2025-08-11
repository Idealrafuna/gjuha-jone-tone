import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Dialect = "gheg" | "tosk";

interface DialectToggleProps {
  value: Dialect;
  onChange: (dialect: Dialect) => void;
}

export const DialectToggle = ({ value, onChange }: DialectToggleProps) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Dialect)}>
      <TabsList>
        <TabsTrigger value="gheg">Gegë</TabsTrigger>
        <TabsTrigger value="tosk">Toskë</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
