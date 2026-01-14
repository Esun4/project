import { useParams } from "react-router-dom";
import Canvas from "../components/mindmap/Canvas";
import Toolbar from "../components/mindmap/Toolbar";
import { useMindMap } from "../hooks/useMindMap";

export default function MindMap() {
  const { id } = useParams();
  const { nodes, addNode } = useMindMap();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Toolbar addNode={addNode} />
      <Canvas nodes={nodes} />
    </div>
  );
}
