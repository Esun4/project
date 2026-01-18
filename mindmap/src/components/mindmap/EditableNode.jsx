import { Handle, Position, NodeResizer } from '@xyflow/react';
import { useState } from 'react';

const NODE_DEFAULTS = {
  label: 'New Node',
  color: '#ffffff',
  borderColor: '#555555',
  borderWidth: 2,
  textColor: '#000000',
  fontSize: 12,
  fontFamily: "'Quicksand', 'Google Sans Code', sans-serif",
};

export default function EditableNode({ id, data, selected }) {
  const [editing, setEditing] = useState(false);

  // Apply defaults
  const label = data.label ?? NODE_DEFAULTS.label;
  const color = data.color ?? NODE_DEFAULTS.color;
  const borderColor = data.borderColor ?? NODE_DEFAULTS.borderColor;
  const borderWidth = data.borderWidth ?? NODE_DEFAULTS.borderWidth;
  const textColor = data.textColor ?? NODE_DEFAULTS.textColor;
  const fontSize = data.fontSize ?? NODE_DEFAULTS.fontSize;
  const fontFamily = data.fontFamily ?? NODE_DEFAULTS.fontFamily;

  const isValid = data.isValidConnection;

  // Style for "Invisible" handles that still work for shortest-path logic
  const handleStyle = {
    background: '#000000',       // Dark grey dots
    border: '1px solid #fff', // White ring around the dot
    width: '1px',
    height: '1px',
    zIndex: 10,
  };

  return (
    <>
      {selected && !editing && <NodeResizer minWidth={120} minHeight={50} />}

      <div
        style={{
          padding: 10,
          borderRadius: 6,
          border: `${borderWidth}px solid ${borderColor}`,
          background: color,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          fontFamily: fontFamily,
          boxShadow: selected && !editing ? '0 0 0 2px rgba(0,123,255,0.4)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative', // Necessary for handles to absolute position correctly
        }}
        onDoubleClick={() => setEditing(true)}
      >
        <Handle type="target" position={Position.Top} id="t" style={handleStyle} isValidConnection={isValid} />
        <Handle type="source" position={Position.Top} id="t" style={{...handleStyle, opacity: 0}} isValidConnection={isValid} />

        <Handle type="target" position={Position.Right} id="r" style={handleStyle} isValidConnection={isValid} />
        <Handle type="source" position={Position.Right} id="r" style={{...handleStyle, opacity: 0}} isValidConnection={isValid} />

        <Handle type="target" position={Position.Bottom} id="b" style={handleStyle} isValidConnection={isValid} />
        <Handle type="source" position={Position.Bottom} id="b" style={{...handleStyle, opacity: 0}} isValidConnection={isValid} />

        <Handle type="target" position={Position.Left} id="l" style={handleStyle} isValidConnection={isValid} />
        <Handle type="source" position={Position.Left} id="l" style={{...handleStyle, opacity: 0}} isValidConnection={isValid} />
        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => data.onChange(id, e.target.value)}
            onBlur={() => setEditing(false)}
            style={{
              width: '90%',
              fontFamily: fontFamily,
              fontWeight: 'normal',
              fontSize: fontSize,
              color: textColor,
              border: '1px solid #ccc',
              padding: 4,
              borderRadius: 4,
              background: '#fff',
            }}
          />
        ) : (
          <div
            style={{
              color: textColor,
              fontSize: fontSize,
              fontWeight: 'normal',
              fontFamily: fontFamily,
              textAlign: 'center',
              width: '100%',
              wordBreak: 'break-word',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </>
  );
}