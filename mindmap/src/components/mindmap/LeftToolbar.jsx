import React from 'react';
import './LeftToolbar.css';

export default function LeftToolbar({
  onAdd, onDeleteNode, onDeleteEdge, onUndo, onRedo, 
  onClearBoard, onBgConfigChange, bgConfig,
  canDeleteNode, canDeleteEdge, canUndo, canRedo,
}) {
  return (
    <div className="left-toolbar">
      <div className="toolbar-section-title">Edit</div>
      <button className="toolbar-btn" onClick={onAdd}>
        Add Node
      </button>
      <button className="toolbar-btn" onClick={onDeleteNode} disabled={!canDeleteNode}>
        Delete Node
      </button>
      <button className="toolbar-btn" onClick={onDeleteEdge} disabled={!canDeleteEdge}>
        Delete Edge
      </button>
    
      <div style={{ display: 'flex', gap: '4px' }}>
        <button className="toolbar-btn" style={{flex: 1}} onClick={onUndo} disabled={!canUndo}>⮜</button>
        <button className="toolbar-btn" style={{flex: 1}} onClick={onRedo} disabled={!canRedo}>⮞</button>
      </div>

      <div className="toolbar-section-title">Canvas Pattern</div>
      <select 
        className="toolbar-select"
        value={bgConfig.variant} 
        onChange={(e) => onBgConfigChange({ ...bgConfig, variant: e.target.value })}
      >
        <option value="dots">Dotted Grid</option>
        <option value="lines">Line Grid</option>
        <option value="none">No Pattern</option>
      </select>

      <div className="toolbar-section-title">Canvas Color</div>
      <input 
        type="color" 
        className="color-picker-input"
        value={bgConfig.color} 
        onChange={(e) => onBgConfigChange({ ...bgConfig, color: e.target.value })}
      />

      <div style={{ marginTop: '5px' }}>
        <button className="toolbar-btn danger" onClick={onClearBoard}>
          Clear Board
        </button>
      </div>
    </div>
  );
}