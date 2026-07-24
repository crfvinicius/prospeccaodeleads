import { KanbanBoard } from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">CRM de Leads</h1>
      <KanbanBoard />
    </div>
  );
}
