import { useConnectionStore } from "./stores/connectionStore";
import { ConnectionPage } from "./pages/ConnectionPage";
import { ToolPage } from "./pages/ToolPage";

function App() {
  const { isConnected } = useConnectionStore();
  return isConnected ? <ToolPage /> : <ConnectionPage />;
}

export default App;
