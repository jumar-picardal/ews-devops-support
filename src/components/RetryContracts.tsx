import React, { useState } from 'react';
import { useCase1Retry } from '../hooks/retryContracts/useCase1Retry';
import { useCase2Retry } from '../hooks/retryContracts/useCase2Retry';
import { useCase3Retry } from '../hooks/retryContracts/useCase3Retry';
import { useCase4Retry } from '../hooks/retryContracts/useCase4Retry';
import { useCase5Retry } from '../hooks/retryContracts/useCase5Retry';
import { useCase6Retry } from '../hooks/retryContracts/useCase6Retry';
import { useCase7Retry } from '../hooks/retryContracts/useCase7Retry';
import { RETRY_CASES } from '../constants/retryCases';
import '../styles/design-system.css';

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

/**
 * Message types for user feedback
 */
type MessageType = 'success' | 'error' | 'info' | 'warning';

/**
 * Message object structure
 */
interface Message {
  type: MessageType;
  text: string;
}

/**
 * Retry progress tracking
 */
interface RetryProgress {
  current: number;
  total: number;
}

/**
 * Available retry case types
 */
type RetryType = 'case1' | 'case2' | 'case3' | 'case4' | 'case5' | 'case6' | 'case7';

// ============================================================================
// COMPONENT
// ============================================================================

const RetryContracts: React.FC = () => {
  // Custom hooks
  const { retryCase1 } = useCase1Retry();
  const { retryCase2 } = useCase2Retry();
  const { retryCase3 } = useCase3Retry();
  const { retryCase4 } = useCase4Retry();
  const { retryCase5 } = useCase5Retry();
  const { retryCase6 } = useCase6Retry();
  const { retryCase7 } = useCase7Retry();
  
  // State management with proper TypeScript types
  const [contractIds, setContractIds] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [retryProgress, setRetryProgress] = useState<RetryProgress>({ current: 0, total: 0 });
  const [successfulContracts, setSuccessfulContracts] = useState<string[]>([]);
  const [failedContracts, setFailedContracts] = useState<string[]>([]);
  const [skippedContracts, setSkippedContracts] = useState<string[]>([]);
  const [justCopiedSuccess, setJustCopiedSuccess] = useState<boolean>(false);
  const [justCopiedFailed, setJustCopiedFailed] = useState<boolean>(false);
  const [justCopiedSkipped, setJustCopiedSkipped] = useState<boolean>(false);
  const [retryType, setRetryType] = useState<RetryType>('case1');
  const [isMessagesExpanded, setIsMessagesExpanded] = useState<boolean>(false);

  /**
   * Add a message to the message list
   */
  const addMessage = (type: MessageType, text: string): void => {
    setMessages(prev => [{ type, text }, ...prev.slice(0, 30)]);
  };

  const handlePause = () => {
    setIsPaused(true);
    addMessage('info', 'Pause requested... will pause after current contract finishes');
  };

  const handleResume = () => {
    setIsPaused(false);
    addMessage('info', 'Resuming retry process...');
  };

  const handleClearAll = () => {
    if (isRetrying) {
      const confirmed = window.confirm(
        'Retry process is currently running. Are you sure you want to stop and clear all data?'
      );
      
      if (!confirmed) {
        return;
      }
      
      setIsRetrying(false);
      setIsPaused(false);
    }
    
    setContractIds('');
    setMessages([]);
    setRetryProgress({ current: 0, total: 0 });
    setSuccessfulContracts([]);
    setFailedContracts([]);
    setSkippedContracts([]);
    setRetryType('case1');
    setIsMessagesExpanded(false);
    
    addMessage('info', 'All data cleared');
  };

  const handleContractsValidation = async () => {
    const lines = contractIds.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      addMessage('error', 'No contract IDs to retry');
      return;
    }

    setIsRetrying(true);
    setIsPaused(false);
    setRetryProgress({ current: 0, total: lines.length });
    setSuccessfulContracts([]);
    setFailedContracts([]);
    setSkippedContracts([]);
    addMessage('info', `Starting smart retry for ${lines.length} contract(s) using ${retryType}...`);

    const successful: string[] = [];
    const failed: string[] = [];
    const skipped: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      // Check if paused
      if (isPaused) {
        addMessage('warning', 'Retry process paused. Click RESUME to continue.');
        while (isPaused && isRetrying) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (!isRetrying) {
          addMessage('info', 'Retry process stopped by user');
          break;
        }
        addMessage('info', 'Resuming retry process...');
      }

      const contractId = lines[i].trim();
      setRetryProgress({ current: i + 1, total: lines.length });
      
      try {
        addMessage('info', `[${i + 1}/${lines.length}] Processing contract ${contractId}...`);
        
        // Execute the appropriate retry case
        let result;
        switch (retryType) {
          case 'case1':
            result = await retryCase1(contractId);
            break;
          case 'case2':
            result = await retryCase2(contractId);
            break;
          case 'case3':
            result = await retryCase3(contractId);
            break;
          case 'case4':
            result = await retryCase4(contractId);
            break;
          case 'case5':
            result = await retryCase5(contractId);
            break;
          case 'case6':
            result = await retryCase6(contractId);
            break;
          case 'case7':
            result = await retryCase7(contractId);
            break;
          default:
            throw new Error(`Unknown retry type: ${retryType}`);
        }
        
        if (result.retryAttempted) {
          if (result.success) {
            successful.push(contractId);
            setSuccessfulContracts(prev => [...prev, contractId]);
            addMessage('success', `✓ Contract ${contractId}: ${result.message}`);
          } else {
            failed.push(contractId);
            setFailedContracts(prev => [...prev, contractId]);
            addMessage('error', `✗ Contract ${contractId}: ${result.message}${result.details ? ` - ${result.details}` : ''}`);
          }
        } else {
          // No retry attempted - contract skipped
          skipped.push(contractId);
          setSkippedContracts(prev => [...prev, contractId]);
          addMessage('info', `⊘ Contract ${contractId}: ${result.message}`);
        }
      } catch (error) {
        failed.push(contractId);
        setFailedContracts(prev => [...prev, contractId]);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addMessage('error', `✗ Contract ${contractId}: ${errorMessage}`);
      }
      
      // Small delay between requests to avoid overwhelming the server
      if (i < lines.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsRetrying(false);
    setIsPaused(false);
    
    // Final summary
    addMessage('info', `Retry process completed: ${successful.length} successful, ${failed.length} failed, ${skipped.length} skipped`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lines = value.split('\n');
    const processedLines = lines.map(line => {
      return line.replace(/\D/g, '').slice(0, 10);
    });
    
    setContractIds(processedLines.join('\n'));
  };

  const getContractIdCount = () => {
    return contractIds.split('\n').filter(line => line.trim().length > 0).length;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addMessage('success', `${type} contract IDs copied to clipboard!`);
      
      if (type === 'Successful') {
        setJustCopiedSuccess(true);
        setTimeout(() => setJustCopiedSuccess(false), 2000);
      } else if (type === 'Failed') {
        setJustCopiedFailed(true);
        setTimeout(() => setJustCopiedFailed(false), 2000);
      } else if (type === 'Skipped') {
        setJustCopiedSkipped(true);
        setTimeout(() => setJustCopiedSkipped(false), 2000);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
      addMessage('error', 'Failed to copy to clipboard');
    });
  };

  return (
    <>
      <title>Retry Contracts - EWS DevOps Support</title>
      <div className="page-container">
        <div className="content-wrapper">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 className="card-title" style={{ textAlign: 'left', margin: 0 }}>Retry Contracts</h1>
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={handleClearAll}
              title={isRetrying ? "Stop retry and clear all data" : "Clear all data and reset the form"}
            >
              CLEAR ALL
            </button>
          </div>
          
          <div className="card-body">
            <div className="alert alert-info">
              <p style={{ margin: 0 }}>Enter contract IDs (one per line) to retry multiple contracts at once.</p>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--color-telus-blue)', marginBottom: '15px' }}>
                Contract IDs
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label htmlFor="retryType" className="form-label">Retry operation</label>
                  <select
                    id="retryType"
                    name="retryType"
                    value={retryType}
                    onChange={(e) => setRetryType(e.target.value as RetryType)}
                    className="form-select"
                    disabled={isRetrying}
                  >
                    {RETRY_CASES.map(retryCase => (
                      <option key={retryCase.id} value={retryCase.id}>
                        {retryCase.label}: {retryCase.description}
                      </option>
                    ))}
                  </select>
                  
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f2f5', borderRadius: '4px', fontSize: '13px' }}>
                    {RETRY_CASES.find(c => c.id === retryType) && (
                      <>
                        <strong>Action:</strong>
                        <ul style={{ marginTop: '5px', marginBottom: '0', paddingLeft: '20px' }}>
                          {RETRY_CASES.find(c => c.id === retryType)!.actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label htmlFor="contractIds" className="form-label" style={{ margin: 0 }}>
                      Enter Contract IDs
                      {contractIds.trim() && (
                        <span style={{ marginLeft: '5px', color: 'var(--color-neutral-500)' }}>
                          ({getContractIdCount()})
                        </span>
                      )}
                    </label>
                  </div>
                  <textarea
                    id="contractIds"
                    name="contractIds"
                    value={contractIds}
                    onChange={handleInputChange}
                    placeholder="Enter contract IDs (one per line)&#10;999999999&#10;999999999&#10;999999999"
                    rows={10}
                    className="form-textarea"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', minHeight: '240px' }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: '#ddd', margin: '30px 0' }}></div>
            
            {isRetrying && retryProgress.total > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-700)', textAlign: 'center' }}>
                  Processing contract {retryProgress.current} of {retryProgress.total}...
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(retryProgress.current / retryProgress.total) * 100}%`, height: '100%', backgroundColor: 'var(--color-telus-green)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
              {!isRetrying ? (
                <button type="button" className="btn btn-success btn-lg" onClick={handleContractsValidation} disabled={!contractIds.trim()} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  RETRY ALL
                </button>
              ) : isPaused ? (
                <button type="button" className="btn btn-success btn-lg" onClick={handleResume} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  RESUME
                </button>
              ) : (
                <button type="button" className="btn btn-lg" onClick={handlePause} style={{ backgroundColor: '#ff9800', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PAUSE
                </button>
              )}
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-telus-blue)' }}>Results</h3>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsMessagesExpanded(!isMessagesExpanded)} style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '40px' }}>
                {isMessagesExpanded ? '−' : '+'}
              </button>
            </div>
            <div style={{ maxHeight: isMessagesExpanded ? '600px' : '200px', overflow: 'auto', transition: 'max-height 0.3s ease' }}>
              {messages.map((msg, index) => (
                <div key={index} className={`alert alert-${msg.type}`} style={{ marginBottom: '8px', opacity: 1 - (index * 0.05) }}>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {(isRetrying || successfulContracts.length > 0 || failedContracts.length > 0 || skippedContracts.length > 0) && (
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--color-telus-blue)', marginBottom: '20px' }}>Retry Results</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', minHeight: '32px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-success)' }}>
                    ✓ Successful ({successfulContracts.length})
                  </h3>
                  <button
                    type="button"
                    className={`btn btn-sm ${justCopiedSuccess ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => successfulContracts.length > 0 && copyToClipboard(successfulContracts.join('\n'), 'Successful')}
                    style={{ visibility: successfulContracts.length > 0 ? 'visible' : 'hidden', pointerEvents: successfulContracts.length > 0 ? 'auto' : 'none' }}
                  >
                    {justCopiedSuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={successfulContracts.join('\n')}
                  placeholder="Successful contract IDs will appear here..."
                  rows={8}
                  className="form-textarea"
                  style={{ backgroundColor: '#f0f9ff', fontFamily: 'var(--font-mono)', fontSize: '14px', cursor: 'text', opacity: 1 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', minHeight: '32px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-error)' }}>
                    ✗ Failed ({failedContracts.length})
                  </h3>
                  <button
                    type="button"
                    className={`btn btn-sm ${justCopiedFailed ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => failedContracts.length > 0 && copyToClipboard(failedContracts.join('\n'), 'Failed')}
                    style={{ visibility: failedContracts.length > 0 ? 'visible' : 'hidden', pointerEvents: failedContracts.length > 0 ? 'auto' : 'none' }}
                  >
                    {justCopiedFailed ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={failedContracts.join('\n')}
                  placeholder="Failed contract IDs will appear here..."
                  rows={8}
                  className="form-textarea"
                  style={{ backgroundColor: '#fff5f5', fontFamily: 'var(--font-mono)', fontSize: '14px', cursor: 'text', opacity: 1 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', minHeight: '32px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>
                    ⊘ Skipped ({skippedContracts.length})
                  </h3>
                  <button
                    type="button"
                    className={`btn btn-sm ${justCopiedSkipped ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => skippedContracts.length > 0 && copyToClipboard(skippedContracts.join('\n'), 'Skipped')}
                    style={{ visibility: skippedContracts.length > 0 ? 'visible' : 'hidden', pointerEvents: skippedContracts.length > 0 ? 'auto' : 'none' }}
                  >
                    {justCopiedSkipped ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={skippedContracts.join('\n')}
                  placeholder="Skipped contract IDs will appear here..."
                  rows={8}
                  className="form-textarea"
                  style={{ backgroundColor: '#f9f9f9', fontFamily: 'var(--font-mono)', fontSize: '14px', cursor: 'text', opacity: 1 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default RetryContracts;
