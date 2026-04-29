import { useAuthStore } from "./stores/authStore";
import { ConnectionPage } from "./pages/ConnectionPage";
import { ToolPage } from "./pages/ToolPage";

function App() {
  const { isConnected } = useAuthStore();
  return isConnected ? <ToolPage /> : <ConnectionPage />;
}

export default App;