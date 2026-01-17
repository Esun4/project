import { useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import useUndo from 'use-undo';

// Styles
import '@xyflow/react/dist/style.css';

// Components
import EditableNode from '../components/mindmap/EditableNode';
import LeftToolbar from '../components/mindmap/LeftToolbar';
import NodeInspector from '../components/mindmap/NodeInspector';
import EdgeInspector from '../components/mindmap/EdgeInspector';

import { NODE_DEFAULTS, EDGE_DEFAULTS } from '../components/mindmap/defaults';

const nodeTypes = { editable: EditableNode };

const initialState = {
  nodes: [
    {
      id: 'n1',
      type: 'editable',
      position: { x: 0, y: 0 },
      data: { ...NODE_DEFAULTS, label: 'empty node' },
    },
  ],
  edges: [],
};

function FlowInner() {
  const { id } = useParams(); // Now accessible via FlowInner
  const { screenToFlowPosition } = useReactFlow();
  const [state, { set, undo, redo, canUndo, canRedo }] = useUndo(initialState);
  const { nodes, edges } = state.present || { nodes: [], edges: [] };

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null });

  // --- Logic Handlers ---

  const onNodesChange = useCallback(
    (changes) => set({ nodes: applyNodeChanges(changes, nodes), edges }, false),
    [nodes, edges, set]
  );

  const onEdgesChange = useCallback(
    (changes) => set({ nodes, edges: applyEdgeChanges(changes, edges) }),
    [nodes, edges, set]
  );

  const onConnect = useCallback(
    (params) => set({ nodes, edges: addEdge({ ...params, style: { ...EDGE_DEFAULTS } }, edges) }),
    [nodes, edges, set]
  );

  const onNodeChange = useCallback((id, value) => {
    set({
      nodes: nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: value } } : node
      ),
      edges,
    });
  }, [nodes, edges, set]);

  const onDeleteNode = (nodeId) => {
    const idToDelete = typeof nodeId === 'string' ? nodeId : selectedNodeId;
    if (!idToDelete) return;
    set({
      nodes: nodes.filter((n) => n.id !== idToDelete),
      edges: edges.filter((e) => e.source !== idToDelete && e.target !== idToDelete),
    });
    setSelectedNodeId(null);
  };

  const onAddNodeAtPosition = (clientX, clientY) => {
    const position = screenToFlowPosition({ x: clientX, y: clientY });
    const maxId = nodes.reduce((max, node) => {
      const num = parseInt(node.id.replace('n', '')) || 0;
      return num > max ? num : max;
    }, 0);
    const newId = `n${maxId + 1}`;

    set({
      nodes: [
        ...nodes,
        {
          id: newId,
          type: 'editable',
          position,
          data: { ...NODE_DEFAULTS, label: 'empty node' },
        },
      ],
      edges,
    });
  };

  // --- Helpers ---
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);

  const nodesWithHandlers = useMemo(() => nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onChange: onNodeChange,
      isValidConnection: (conn) => !edges.some(e => 
        (e.source === conn.source && e.target === conn.target) || 
        (e.source === conn.target && e.target === conn.source)
      )
    },
  })), [nodes, edges, onNodeChange]);

  // Keybindings
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) redo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <LeftToolbar 
          onAdd={() => onAddNodeAtPosition(window.innerWidth/2, window.innerHeight/2)} 
          onDelete={onDeleteNode} 
          onUndo={undo} onRedo={redo}
          canDelete={!!selectedNodeId} canUndo={canUndo} canRedo={canRedo} 
        />

        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={({ nodes, edges }) => {
              setSelectedNodeId(nodes[0]?.id || null);
              setSelectedEdgeId(edges[0]?.id || null);
            }}
            onNodeContextMenu={(e, node) => {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId: node.id });
            }}
            onPaneContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId: null });
            }}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <NodeInspector node={selectedNode} updateNode={(u) => set({ nodes: nodes.map(n => n.id === selectedNodeId ? {...n, data: {...n.data, ...u}} : n), edges })} />
        <EdgeInspector edge={selectedEdge} updateEdge={(u) => set({ nodes, edges: edges.map(e => e.id === selectedEdgeId ? {...e, ...u} : e) })} />

        {/* --- CONTEXT MENU JSX --- */}
        {contextMenu.visible && (
          <div
            style={{
              position: 'fixed', // Changed to fixed to ensure it stays on top of the UI
              top: contextMenu.y,
              left: contextMenu.x,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '4px',
              borderRadius: '8px',
              zIndex: 10000,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              minWidth: '150px',
              fontFamily: "'Quicksand', sans-serif"
            }}
            onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
          >
            {contextMenu.nodeId ? (
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#cc0000', fontWeight: '600' }}
                onClick={() => {
                  onDeleteNode(contextMenu.nodeId);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                Delete Node
              </div>
            ) : (
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#2d3748', fontWeight: '600' }}
                onClick={() => {
                  onAddNodeAtPosition(contextMenu.x, contextMenu.y);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                Add Node
              </div>
            )}
          </div>
        )}
      </div>
    );
}

export default function MindMap() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ReactFlowProvider>
        <FlowInner />
      </ReactFlowProvider>
    </div>
  );
}