const axios = require('axios');
const https = require('https');

const loginToIlo = async (iloIp) => {
  try {
    const sessionUrl = `https://${iloIp}/redfish/v1/SessionService/Sessions`;
    const response = await axios.post(
      sessionUrl,
      { UserName: process.env.ILO_USERNAME, Password: process.env.ILO_PASSWORD },
      { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }
    );
    return response.headers['x-auth-token'];
  } catch (error) {
    console.error('Login to iLO failed:', error.message);
    throw new Error('Login to iLO failed');
  }
};

const sendResetCommand = async (iloIp, resetType) => {
  const token = await loginToIlo(iloIp);

  try {
    const actionUrl = `https://${iloIp}/redfish/v1/Systems/1/Actions/ComputerSystem.Reset`;
    await axios.post(
      actionUrl,
      { ResetType: resetType },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending reset command:', error.message);
    throw new Error('Error sending reset command');
  }
};


const getIloStatus = async (req, res) => {
  const { iloIp } = req.params;
  const iloUser = process.env.ILO_USERNAME;
  const iloPass = process.env.ILO_PASSWORD;

  try {
    const response = await axios.get(`https://${iloIp}/redfish/v1/Systems/1/`, {
      auth: {
        username: iloUser,
        password: iloPass,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const powerState = response.data.PowerState;
    res.json({ powerState });
  } catch (err) {
    console.error('iLO API error:', err.message);
    res.status(500).json({ error: 'Unable to fetch server status' });
  }
};


module.exports = {
  rebootServer: (iloIp) => sendResetCommand(iloIp, 'ForceRestart'),
  powerOnServer: (iloIp) => sendResetCommand(iloIp, 'On'),
  powerOffServer: (iloIp) => sendResetCommand(iloIp, 'ForceOff'),
  getIloStatus,
};
