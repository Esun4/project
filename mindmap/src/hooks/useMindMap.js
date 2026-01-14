import { useState } from "react";

export function useMindMap() {
  const [nodes, setNodes] = useState([]);

  function addNode(x, y) {
    setNodes((n) => [
      ...n,
      { id: crypto.randomUUID(), x, y, text: "New Node" },
    ]);
  }

  return {
    nodes,
    addNode,
  };
}
