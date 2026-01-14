import { useParams } from "react-router-dom";
import Canvas from "../components/mindmap/Canvas";
import Toolbar from "../components/mindmap/Toolbar";

export default function MindMap() {
  const { id } = useParams();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Toolbar />
      <Canvas mapId={id} />
    </div>
  );
}
