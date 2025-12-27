const Server = require('../models/serverModel');
const iloService = require('../services/iloService');
const {getILOData} = require('../getdata.mjs')


// const getilodata = async (req, res) => {
//   const { iloip } = req.params;

//   try {
//     const data = await getILOData(iloip);
//     if (!data) return res.status(404).json({ error: 'ILO data not found' });

//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch iLO data' });
//   }
// }

// Get all servers
const getServers = async (req, res) => {
  try {
    const servers = await Server.find();
    res.json(servers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new server
const addServer = async (req, res) => {
  const { name, iloIp, networkIp } = req.body;
  try {
    const newServer = new Server({ name, iloIp, networkIp });
    await newServer.save();
    res.status(201).json(newServer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Control server (reboot, power on/off)
const controlServer = async (req, res) => {
  const { action, id } = req.params;
  console.log(req.params);
  console.log(id);
  
  try {
    const server = await Server.findById(id);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    console.log(server.iloIp);
    
    let result;
    if (action === 'reboot') {
      result = await iloService.rebootServer(server.iloIp);
    } else if (action === 'poweron') {
      result = await iloService.powerOnServer(server.iloIp);
    } else if (action === 'poweroff') {
      result = await iloService.powerOffServer(server.iloIp);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
     console.log(1);
     
    res.json({ message: `Server ${action} successfully`, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getIloStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    const server = await Server.findById(id);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    const status = await iloService.getIloStatus(server.iloIp);
    res.json({ status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getServers, addServer, controlServer , getIloStatus };
