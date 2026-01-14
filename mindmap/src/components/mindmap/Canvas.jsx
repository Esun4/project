import { useState } from "react";
import Node from "./Node";

export default function Canvas({ mapId }) {
  const [nodes, setNodes] = useState([
    { id: "1", x: 200, y: 200, text: "Central Idea" },
  ]);

  function addNode() {
    setNodes([
      ...nodes,
      {
        id: crypto.randomUUID(),
        x: 300,
        y: 300,
        text: "New Node",
      },
    ]);
  }

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {nodes.map((node) => (
        <Node key={node.id} node={node} />
      ))}

      <button onClick={addNode} style={{ position: "absolute", bottom: 20, left: 20 }}>
        + Node
      </button>
    </div>
  );
}
