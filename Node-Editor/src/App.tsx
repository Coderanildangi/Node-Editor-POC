import "./App.css";
import { useRete } from "rete-react-plugin";
import { createEditor } from "./editor";
import Toolbar from "./components/toolbar";

function App() {
  const [ref] = useRete(createEditor);

  return (
    <div className="App">
      <Toolbar />
      <div ref={ref} style={{ height: "100vh", width: "100vw", marginTop: "50px" }}></div>
    </div>
  );
}

export default App;
