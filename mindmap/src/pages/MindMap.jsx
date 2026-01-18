import { useParams, useNavigate } from "react-router-dom";
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
import { toPng } from 'html-to-image';

// Styles
import '@xyflow/react/dist/style.css';
import '../pages/MindMap.css'; 

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
  const { id } = useParams();
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();
  const [state, { set, undo, redo, canUndo, canRedo }] = useUndo(initialState);
  const { nodes, edges } = state.present || { nodes: [], edges: [] };

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null });

  // AI STATES
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // MANUAL AI FETCH LOGIC
  const handleGetSuggestions = useCallback(async () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    
    // Guard clause
    if (!selectedNode || !selectedNode.data.label || selectedNode.data.label.toLowerCase().includes('empty')) {
      alert("Please enter text in the selected node first.");
      return;
    }

    setIsAnalyzing(true);
    setAiSuggestions([]);

    // 1. Logic: Identify IDs of nodes already connected to the selected node
    const alreadyConnectedIds = edges
      .filter(edge => edge.source === selectedNodeId || edge.target === selectedNodeId)
      .map(edge => edge.source === selectedNodeId ? edge.target : edge.source);

    try {
      const response = await fetch("http://localhost:8000/analyze-similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active_node: { 
            id: selectedNode.id, 
            text: selectedNode.data.label,
            x: selectedNode.position.x,
            y: selectedNode.position.y
          },
          // 2. Filter: Only send nodes that are NOT the selected one AND NOT already connected
          other_nodes: nodes
            .filter(n => n.id !== selectedNodeId && !alreadyConnectedIds.includes(n.id))
            .map(n => ({ 
              id: n.id, 
              text: n.data.label,
              x: n.position.x,
              y: n.position.y
            }))
        })
      });

      const data = await response.json();
      // Ensure data is an array (the backend should return top 3-5 suggestions)
      setAiSuggestions(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("AI Service offline", err);
      alert("Could not connect to the AI service.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, edges, selectedNodeId]); // Added edges to dependency array

  useEffect(() => {
    setAiSuggestions([]);
    setHoveredSuggestionId(null);
  }, [selectedNodeId]);

  const handleSaveSnapshot = useCallback(async () => {
    if (reactFlowWrapper.current === null) return;

    const dataUrl = await toPng(reactFlowWrapper.current, {
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (
          node?.classList?.contains('react-flow__controls') ||
          node?.classList?.contains('react-flow__minimap')
        ) {
          return false;
        }
        return true;
      },
    });

    console.log("Snapshot generated!", dataUrl);
  }, [state.present, id]);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null); // Hide node inspector while editing edge
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const onNodesChange = useCallback(
    (changes) => set({ nodes: applyNodeChanges(changes, nodes), edges }, false),
    [nodes, edges, set]
  );

  const onEdgesChange = useCallback(
    (changes) => set({ nodes, edges: applyEdgeChanges(changes, edges) }),
    [nodes, edges, set]
  );

  const onConnect = useCallback(
    (params) => {
      // If params has sourceHandle, it means a user manually dragged to a specific dot.
      // If it's missing (AI connection), React Flow will find the best dot automatically.
      const edgeData = {
        ...params, // This keeps the specific handle IDs you dragged to
        type: 'smoothstep', 
        style: { stroke: '#000', strokeWidth: 2 },
      };

      set({ 
        nodes, 
        edges: addEdge(edgeData, edges) 
      });
    },
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
      nodes: [...nodes, { id: newId, type: 'editable', position, data: { ...NODE_DEFAULTS, label: 'empty node' } }],
      edges,
    });
  };

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);

  const nodesWithHandlers = useMemo(() => nodes.map((n) => ({
      ...n,
      className: hoveredSuggestionId === n.id ? 'ai-glow-node' : '',
      data: {
        ...n.data,
        onChange: onNodeChange,
        isValidConnection: (conn) => !edges.some(e => 
          (e.source === conn.source && e.target === conn.target) || 
          (e.source === conn.target && e.target === conn.source)
        )
      },
    })), [nodes, edges, onNodeChange, hoveredSuggestionId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) redo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <div className="mindmap-page-wrapper">
      <header className="mindmap-topbar">
        <div className="topbar-left">
          <button className="mm-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <h2 className="topbar-title">Mind Map: {id}</h2>
        </div>
        <div className="topbar-right">
          <button className="mm-button mm-button-primary" onClick={handleSaveSnapshot}>Save</button>
        </div>
      </header>

      <div className="main-layout-body">
        <div className="flow-container">
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
              // ADD THESE THREE PROPS BELOW:
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              onSelectionChange={({ nodes }) => {
                if (nodes.length > 0) {
                  setSelectedNodeId(nodes[0].id);
                  setSelectedEdgeId(null); // Hide edge inspector if node is clicked
                }
              }}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>

        <aside className="ai-sidebar">
          <div className="ai-sidebar-header">
            <span>✨</span> AI Insights
          </div>
          <div className="ai-sidebar-content">
            {/* 3. Logic: Button is disabled if no node is selected OR if it's currently analyzing */}
            <button 
              className="mm-button mm-button-primary" 
              style={{ 
                width: '100%', 
                marginBottom: '20px',
                opacity: (!selectedNodeId || isAnalyzing) ? 0.6 : 1,
                cursor: (!selectedNodeId || isAnalyzing) ? 'not-allowed' : 'pointer'
              }}
              onClick={handleGetSuggestions}
              disabled={!selectedNodeId || isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Get AI Suggestions"}
            </button>

            {!selectedNodeId ? (
              <p className="ai-empty">Select a node to see suggestions</p>
            ) : aiSuggestions.length === 0 && !isAnalyzing ? (
              <p className="ai-empty">No new connections found for this node.</p>
            ) : (
              aiSuggestions.map((s) => {
                const targetNode = nodes.find(n => n.id === s.targetNodeId);
                const label = targetNode?.data?.label || "Unknown Node";
                
                return (
                  <div 
                    key={s.targetNodeId} 
                    className="ai-card"
                    onMouseEnter={() => setHoveredSuggestionId(s.targetNodeId)}
                    onMouseLeave={() => setHoveredSuggestionId(null)}
                  >
                    <div className="ai-badge">{Math.round(s.score * 100)}% Match</div>
                    <p style={{ margin: '8px 0', fontSize: '14px' }}>Link to <strong>"{label}"</strong>?</p>
                    <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginBottom: '10px' }}>
                      "{s.explanation}"
                    </p>
                    <button 
                      className="mm-button"
                      style={{ width: '100%', background: '#000', color: '#fff' }}
                      onClick={() => {
                        onConnect({ 
                          source: selectedNodeId, 
                          target: s.targetNodeId
                          // Notice: NO sourceHandle or targetHandle sent here!
                        });
                        setAiSuggestions(prev => prev.filter(item => item.targetNodeId !== s.targetNodeId));
                      }}
                    >
                      Connect
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      <NodeInspector 
        node={selectedNode} 
        updateNode={(u) => set({ nodes: nodes.map(n => n.id === selectedNodeId ? {...n, data: {...n.data, ...u}} : n), edges })} 
      />
      <EdgeInspector 
        edge={selectedEdge} 
        updateEdge={(u) => set({ nodes, edges: edges.map(e => e.id === selectedEdgeId ? {...e, ...u} : e) })} 
      />

      {/* --- CONTEXT MENU --- */}
      {contextMenu.visible && (
        <div
          className="mm-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
        >
          {contextMenu.nodeId ? (
            <div
              className="mm-context-item mm-context-delete"
              onClick={() => {
                onDeleteNode(contextMenu.nodeId);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete Node
            </div>
          ) : (
            <div
              className="mm-context-item mm-context-add"
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