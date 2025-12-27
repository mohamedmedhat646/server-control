// src/components/ServerList.js
import React, { useEffect, useState } from 'react';
import { getServers } from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaServer, FaPlus, FaNetworkWired, FaCogs, FaPlug, FaSpinner, FaSearch } from 'react-icons/fa';

const ServerList = () => {
  const [servers, setServers] = useState([]);
  const [filteredServers, setFilteredServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const data = await getServers();
        setServers(data);
        setFilteredServers(data);
      } catch (err) {
        setError('Failed to load servers. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => fetchServers(), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServers(servers);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = servers.filter(server => {
        const networkIp = server.networkIp || '';
        const iloIp = server.iloIp ? server.iloIp.toLowerCase() : '';
        const name = server.name ? server.name.toLowerCase() : '';
        return networkIp.includes(lowerSearchTerm) || iloIp.includes(lowerSearchTerm) || name.includes(lowerSearchTerm);
      });
      setFilteredServers(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, servers]);

  const totalPages = Math.ceil(filteredServers.length / pageSize);
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentServers = filteredServers.slice(indexOfFirst, indexOfLast);

  const getServerIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'network': return <FaNetworkWired className="text-info" />;
      case 'management': return <FaCogs className="text-warning" />;
      case 'power': return <FaPlug className="text-danger" />;
      default: return <FaServer className="text-primary" />;
    }
  };

  const renderPagination = () => {
    const pages = [];

    const maxVisible = 5;
    const sideCount = Math.floor(maxVisible / 2);
    const start = Math.max(2, currentPage - sideCount);
    const end = Math.min(totalPages - 1, currentPage + sideCount);

    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 && 'disabled'}`}>
        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>«</button>
      </li>
    );

    pages.push(
      <li key={1} className={`page-item ${currentPage === 1 && 'active'}`}>
        <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
      </li>
    );

    if (start > 2) {
      pages.push(<li key="dots1" className="page-item disabled"><span className="page-link">...</span></li>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i && 'active'}`}>
          <button className="page-link" onClick={() => setCurrentPage(i)}>{i}</button>
        </li>
      );
    }

    if (end < totalPages - 1) {
      pages.push(<li key="dots2" className="page-item disabled"><span className="page-link">...</span></li>);
    }

    if (totalPages > 1) {
      pages.push(
        <li key={totalPages} className={`page-item ${currentPage === totalPages && 'active'}`}>
          <button className="page-link" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
        </li>
      );
    }

    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages && 'disabled'}`}>
        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
      </li>
    );

    return (
      <nav className="mt-4">
        <ul className="pagination justify-content-center">{pages}</ul>
      </nav>
    );
  };

  return (
    <div className="min-vh-100 bg-gradient">
      <div className="position-fixed top-0 left-0 w-100 h-100 bg-gradient-primary z-0"></div>

      <motion.header 
        className="bg-white shadow-sm position-relative z-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-3">
          <div className="d-flex align-items-center">
            <FaServer className="fs-3 me-2 text-primary" />
            <h1 className="h3 fw-bold text-dark mb-0">Server Management Dashboard</h1>
          </div>
        </div>
      </motion.header>

      <main className="container py-5 position-relative z-1">
        <AnimatePresence>
          {error && (
            <motion.div 
              className="alert alert-danger shadow"
              role="alert"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {error}
              <button type="button" className="btn-close float-end" onClick={() => setError(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="card shadow-lg border-0 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
            <h5 className="card-title mb-0 d-flex align-items-center">
              <FaServer className="me-2" /> Server Inventory
            </h5>
            <div>
              {loading ? (
                <span className="d-flex align-items-center">
                  <FaSpinner className="me-2 fa-spin" />
                  Loading server data...
                </span>
              ) : (
                `${filteredServers.length} server${filteredServers.length !== 1 ? 's' : ''} found`
              )}
            </div>
            <Link to="/add" className="btn btn-primary btn-sm d-flex align-items-center">
              <FaPlus className="me-1" /> Add New Server
            </Link>
          </div>

          <div className="card-body bg-light border-bottom">
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Network IP or iLO IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="card-body bg-light">
            {loading ? (
              <div className="row g-4">{/* loading skeleton */}</div>
            ) : currentServers.length === 0 ? (
              <div className="text-center py-5">
                <FaSearch className="text-muted" size={48} />
                <h5 className="text-muted mb-3">No servers found</h5>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {currentServers.map(server => (
                    <div key={server._id} className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm overflow-hidden">
                        <div className="card-header bg-white d-flex align-items-center">
                          <div className="me-2 fs-4">{getServerIcon(server.type)}</div>
                          <h5 className="card-title mb-0">{server.name}</h5>
                        </div>
                        <div className="card-body">
                          <ul className="list-unstyled mb-4">
                            <li><strong>iLO IP:</strong> {server.iloIp}</li>
                            <li><strong>Network IP:</strong> {server.networkIp}</li>
                          </ul>
                          <div className="text-end">
                            <Link to={`/control/${server._id}`} className="btn btn-primary btn-sm px-3">
                              <FaCogs className="me-1" /> Manage
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ServerList;
