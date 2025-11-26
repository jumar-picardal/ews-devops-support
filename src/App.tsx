import { useState } from 'react';
import RetryContracts from './components/RetryContracts';
import ReconcileTender from './components/ReconcileTender';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">EWS DevOps Support</div>
          <ul className="navbar-nav">
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('activate')}
                className={`nav-link ${activeTab === 'activate' ? 'active' : ''}`}
              >
                Activate Warranty
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('reconcile')}
                className={`nav-link ${activeTab === 'reconcile' ? 'active' : ''}`}
              >
                Reconcile Tender
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('retry')}
                className={`nav-link ${activeTab === 'retry' ? 'active' : ''}`}
              >
                Retry Contracts
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'activate' && <ActivateWarrantyPage />}
        {activeTab === 'reconcile' && <ReconcileTenderPage />}
        {activeTab === 'retry' && <RetryContractsPage />}
      </main>
    </div>
  );
}

// Home Page
function HomePage() {
  return (
    <>
      <title>Home - EWS DevOps Support</title>
      <div className="content-wrapper">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Welcome to EWS DevOps Support</h1>
          <p className="card-description">
            A modern application for managing Extended Warranty Services operations
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Activate Warranty</h3>
              <p className="text-sm text-muted">
                Register and activate new warranty contracts with comprehensive data validation.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Reconcile Tender</h3>
              <p className="text-sm text-muted">
                Reconcile tender status and manage warranty contract states.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Retry Contracts</h3>
              <p className="text-sm text-muted">
                Retry failed warranty contracts and monitor processing status.
              </p>
            </div>
          </div>

          <div className="alert alert-info mt-4">
            <div className="alert-title">Getting Started</div>
            <ul className="mt-2">
              <li>• Ensure the proxy server is running on port 3001</li>
              <li>• Configure your environment variables in .env file</li>
              <li>• Select a module from the navigation above to begin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// Activate Warranty Page
function ActivateWarrantyPage() {
  return (
    <>
      <title>Activate Warranty - EWS DevOps Support</title>
      <div className="content-wrapper">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Activate Warranty</h2>
          <p className="card-description">
            Activate and manage warranty contracts for customers
          </p>
        </div>
        <div className="card-body">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="imei">
                  IMEI
                </label>
                <input
                  type="text"
                  id="imei"
                  className="form-input"
                  placeholder="Enter IMEI"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="contractId">
                Contract ID
              </label>
              <input
                type="text"
                id="contractId"
                className="form-input"
                placeholder="Enter contract ID"
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-primary">
                Activate Warranty
              </button>
              <button type="button" className="btn btn-secondary">
                Clear
              </button>
            </div>
          </form>

          <div className="alert alert-info mt-4">
            <div className="alert-title">Information</div>
            <p>Enter customer details to activate warranty. All fields are required for processing.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// Reconcile Tender Page
function ReconcileTenderPage() {
  return <ReconcileTender />;
}

// Retry Contracts Page
function RetryContractsPage() {
  return <RetryContracts />;
}

export default App;
