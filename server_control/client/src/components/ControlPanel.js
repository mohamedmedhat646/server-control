// src/components/ControlPanel.js
import React, { useState, useEffect } from 'react';
import { controlServer, getServers } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const ControlPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState('unknown');
  const [showConfirm, setShowConfirm] = useState({ show: false, action: null });

  useEffect(() => {
    const fetchServer = async () => {
      try {
        setIsLoading(true);
        const servers = await getServers();
        const foundServer = servers.find((s) => s._id === id);
        setServer(foundServer);
        // Simulate status check (replace with actual API call)
        setTimeout(() => {
          setStatus(Math.random() > 0.5 ? 'online' : 'offline');
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to fetch server:', error);
        setIsLoading(false);
      }
    };
    fetchServer();
  }, [id]);

  const handleAction = async (action) => {
    try {
      setActionLoading(action);
      await controlServer(id, action);
      
      // Update status based on action
      if (action === 'poweron') setStatus('online');
      if (action === 'poweroff') setStatus('offline');
      
      // Show success feedback
      setShowConfirm({ show: true, action, success: true });
    } catch (error) {
      console.error('Action failed:', error);
      setShowConfirm({ show: true, action, success: false });
    } finally {
      setActionLoading(false);
      setTimeout(() => setShowConfirm({ show: false, action: null }), 3000);
    }
  };

  const confirmAction = (action) => {
    let message = '';
    switch(action) {
      case 'poweroff':
        message = 'Are you sure you want to power off this server?';
        break;
      case 'reboot':
        message = 'This will reboot the server. Continue?';
        break;
      default:
        message = `Confirm ${action} action?`;
    }
    
    if (window.confirm(message)) {
      handleAction(action);
    }
  };

  const getStatusBadge = () => {
    switch(status) {
      case 'online':
        return <span className="badge bg-success rounded-pill">Online</span>;
      case 'offline':
        return <span className="badge bg-danger rounded-pill">Offline</span>;
      default:
        return <span className="badge bg-secondary rounded-pill">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading server details...</h4>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Server not found
        </div>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Server List
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Success/Failure Alert */}
      {showConfirm.show && (
        <div className={`alert alert-${showConfirm.success ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {showConfirm.success ? 
            `Server ${showConfirm.action} successful!` : 
            `Failed to ${showConfirm.action} server`}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowConfirm({ show: false, action: null })}
          />
        </div>
      )}

      <div className="card shadow-lg border-0 overflow-hidden">
        <div className="card-header bg-dark text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-server me-2"></i>
              {server.name}
            </h3>
            {getStatusBadge()}
          </div>
        </div>

        <div className="card-body">
          {/* Server Details */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <h5 className="text-muted mb-3">Server Details</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong><i className="fas fa-network-wired me-2"></i>iLO IP:</strong> {server.iloIp}
                  </li>
                  <li className="mb-2">
                    <strong><i className="fas fa-ethernet me-2"></i>Network IP:</strong> {server.networkIp}
                  </li>
                  <li>
                    <strong><i className="fas fa-microchip me-2"></i>Model:</strong> {server.model || 'Unknown'}
                  </li>
                </ul>
              </div>
            </div>
            {/* <div className="col-md-6">
              <div className="p-3 bg-light rounded h-100">
                <h5 className="text-muted mb-3">Resource Usage</h5>
                <div className="progress mb-3" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '65%' }}
                    aria-valuenow="65" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    CPU: 65%
                  </div>
                </div>
                <div className="progress mb-3" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: '40%' }}
                    aria-valuenow="40" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    Memory: 40%
                  </div>
                </div>
                <div className="progress" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    role="progressbar" 
                    style={{ width: '25%' }}
                    aria-valuenow="25" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    Storage: 25%
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Control Buttons */}
          <div className="text-center mb-4">
            <h4 className="mb-4">Server Controls</h4>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {/* Power On Button */}
              <button
                onClick={() => confirmAction('poweron')}
                className={`btn btn-lg ${status === 'online' ? 'btn-outline-success' : 'btn-success'} d-flex align-items-center gap-2`}
                disabled={status === 'online' || actionLoading === 'poweron'}
              >
                {actionLoading === 'poweron' ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Powering On...
                  </>
                ) : (
                  <>
                    <i className="fas fa-power-off"></i> Power On
                  </>
                )}
              </button>

              {/* Reboot Button */}
              <button
                onClick={() => confirmAction('reboot')}
                className={`btn btn-lg btn-warning d-flex align-items-center gap-2`}
                disabled={status !== 'online' || actionLoading === 'reboot'}
              >
                {actionLoading === 'reboot' ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Rebooting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt"></i> Reboot
                  </>
                )}
              </button>

              {/* Power Off Button */}
              <button
                onClick={() => confirmAction('poweroff')}
                className={`btn btn-lg ${status === 'offline' ? 'btn-outline-danger' : 'btn-danger'} d-flex align-items-center gap-2`}
                disabled={status === 'offline' || actionLoading === 'poweroff'}
              >
                {actionLoading === 'poweroff' ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Powering Off...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i> Power Off
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Additional Actions */}
          {/* <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
            <button className="btn btn-outline-primary">
              <i className="fas fa-terminal me-2"></i>Remote Console
            </button>
            <button className="btn btn-outline-primary">
              <i className="fas fa-tasks me-2"></i>Processes
            </button>
            <button className="btn btn-outline-primary">
              <i className="fas fa-file-alt me-2"></i>Logs
            </button>
            <button className="btn btn-outline-primary">
              <i className="fas fa-cog me-2"></i>Settings
            </button>
          </div> */}

          {/* Back Button */}
          <div className="text-center pt-3 border-top">
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              <i className="fas fa-arrow-left me-2"></i>Back to Server List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;  