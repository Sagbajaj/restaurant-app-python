import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // This allows us to inject any content (the reviews)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3>{title}</h3>
          <button onClick={onClose} style={{ cursor: 'pointer' }}>X</button>
        </div>
        <div style={contentStyle}>
          {children} 
        </div>
      </div>
    </div>
  );
};

// Simple inline styles for demonstration
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
  width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto'
};

const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'
};

const contentStyle: React.CSSProperties = {
  maxHeight: '60vh', overflowY: 'auto' // Scrollable content inside modal
};

export default Modal;