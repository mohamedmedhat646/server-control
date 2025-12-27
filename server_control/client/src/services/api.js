import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getServers = async () => {
  const response = await axios.get(`${API_URL}/servers`);
  return response.data;
};

const addServer = async (server) => {
  const response = await axios.post(`${API_URL}/servers`, server);
  return response.data;
};

const controlServer = async (id, action) => {
  const response = await axios.post(`${API_URL}/servers/${id}/${action}`);
  return response.data;
};

export { getServers, addServer, controlServer };
