import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Chat from "./pages/Chat";
import Login from "./pages/LoginTemp";

function App() {
  const { token } = useContext(AuthContext);

  return token ? <Chat /> : <Login />;
}

export default App;