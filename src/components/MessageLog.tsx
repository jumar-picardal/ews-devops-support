/**
 * MessageLog Component
 * 
 * Reusable expandable message log for displaying operation results
 * Shows success, error, info, and warning messages with color coding
 */

import { useState } from 'react';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface Message {
  type: MessageType;
  text: string;
}

interface MessageLogProps {
  messages: Message[];
  title?: string;
  defaultExpanded?: boolean;
}

const MessageLog = ({ messages, title = 'Results', defaultExpanded = false }: MessageLogProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (messages.length === 0) return null;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-telus-blue)' }}>{title}</h3>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '40px' }}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      <div style={{ maxHeight: isExpanded ? '600px' : '200px', overflow: 'auto', transition: 'max-height 0.3s ease' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`alert alert-${msg.type}`}
            style={{ 
              marginBottom: '8px', 
              opacity: isExpanded ? 1 : Math.max(0.2, 1 - (index * 0.1))
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageLog;
