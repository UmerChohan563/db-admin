import React from "react";
import { Sidebar } from "../components/ui/Sidebar";
import { TableView } from "../components/ui/TableView";
import { QueryEditor } from "../components/ui/QueryEditor";
import { useExplorerStore } from "../stores/explorerStore";

export const ToolPage: React.FC = () => {
  const { activeView } = useExplorerStore();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {activeView === "table" ? <TableView /> : <QueryEditor />}
      </main>
    </div>
  );
};
