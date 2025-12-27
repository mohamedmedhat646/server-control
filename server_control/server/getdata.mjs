// const axios = require("axios");
// const https = require("https");
import fs from "fs";
import axios from "axios";
import https from "https";
// Replace with your iLO IP, username, and password
const USERNAME = "team";
const PASSWORD = "kc4^QOVuzRn5";
import { MongoClient } from "mongodb";

// MongoDB URI and Database/Collection details
const uri = "mongodb://89.34.226.6:27017"; // Your MongoDB URI
const dbName = "servers";  // Name of your database
const collectionName = "servers"; // Name of your collection

// Create an axios instance with SSL disabled (not recommended for production)
const instance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: { "Content-Type": "application/json" }
});

function logErrorToFile(iloip, errorMessage) {
  const logMessage = `${new Date().toISOString()} - iLO IP: ${iloip} - Error: ${errorMessage}\n`;
  fs.appendFileSync("ilo_errors.log", logMessage, "utf8");
  console.error(`❌ Error logged for ${iloip}: ${errorMessage}`);
}

// Function to fetch iLO details and return as an object
export async function getILOData(iloip) {
  async function updatePlan(iloip, newPlanData) {
      const client = new MongoClient(uri);
  
      try {
          await client.connect();
          console.log("✅ Connected to MongoDB");
  
          const db = client.db(dbName);
          const collection = db.collection(collectionName);
  
          // Update the plan field for a specific iloip
          const result = await collection.updateOne(
              { iloip: iloip }, // Find document by iloip
              { $set: { "plan": newPlanData } } // Update the plan field
          );
  
          console.log(`✅ Updated ${result.modifiedCount} document(s)`);
      } catch (error) {
          console.error("❌ Error updating plan field:", error);
      } finally {
          await client.close();
          console.log("🔒 MongoDB connection closed.");
      }
  }

    const ILO_IP = `https://${iloip}`;
  let authToken = null;
  let sessionId = null;

  try {
    // Login to iLO and get session token
    const loginResponse = await instance.post(`${ILO_IP}/redfish/v1/SessionService/Sessions`, {
      UserName: USERNAME,
      Password: PASSWORD
    });

    if (loginResponse.status !== 201) {
      throw new Error("Login failed: " + JSON.stringify(loginResponse.data));
    }

    authToken = loginResponse.headers["x-auth-token"];
    sessionId = loginResponse.headers["location"]; // Extract session ID for logout

    // Function to send authenticated requests
    async function getData(url) {
      try {
        const response = await instance.get(url, { headers: { "X-Auth-Token": authToken } });
        return response.data;
      } catch (error) {
        logErrorToFile(iloip, `Failed to fetch ${url}: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        console.error(`Error fetching ${url}:`, error.response ? error.response.data : error.message);
        return null;
      }
    }

    // Fetch hostname from EthernetInterfaces
    const ethernetData = await getData(`${ILO_IP}/redfish/v1/Managers/1/EthernetInterfaces`);
    let hostName = "N/A";
    if (ethernetData?.Items?.length > 0) {
      hostName = ethernetData.Items[0].HostName || "N/A";
    }
    // Fetch PCIe devices and categorize them
    const pcieData = await getData(`${ILO_IP}/redfish/v1/Systems/1/PCIDevices/`);
    let nicDevices = [];
    let otherPcieDevices = [];

    if (pcieData?.Items?.length > 0) {
      for (const device of pcieData.Items) {
        if (device.Name.toLowerCase().includes("nic")) {
          nicDevices.push(device.Name);
        } else {
          otherPcieDevices.push(device.Name);
        }
      }
    }
 
    // Fetch system details
    const systemData = await getData(`${ILO_IP}/redfish/v1/Systems/1`);
    if (!systemData) return null;

    // Fetch chassis details
    const chassisData = await getData(`${ILO_IP}/redfish/v1/Chassis/1`);
    const chassis = chassisData ? {
      model: chassisData.Model || "N/A",
      serialNumber: chassisData.SerialNumber || "N/A",
      manufacturer: chassisData.Manufacturer || "N/A"
    } : { model: "N/A", serialNumber: "N/A", manufacturer: "N/A" };
     
 // Fetch disk details
const storageData = await getData(`${ILO_IP}/redfish/v1/Systems/1/SmartStorage/ArrayControllers/`);
let disks = [];

if (storageData?.Members && storageData.Members.length > 0) {
  for (const controller of storageData.Members) {
    const diskDrivesUrl = `${ILO_IP}${controller["@odata.id"]}DiskDrives/`;
    const storageDetails = await getData(diskDrivesUrl);

    if (storageDetails?.Members && storageDetails.Members.length > 0) {
      for (const drive of storageDetails.Members) {
        const diskUrl = `${ILO_IP}${drive["@odata.id"]}`;
        const diskInfo = await getData(diskUrl);

        if (diskInfo && diskInfo.CapacityGB) {
          disks.push(`${diskInfo.CapacityGB} GB - ${diskInfo.MediaType}`);
        }
      }
    }
  }
}

// If no disks are found, explicitly set it
if (disks.length === 0) {
  disks.push("No disks found");
}


    // Extract details
    const systemInfo = {
      name: hostName,
      biosVersion: systemData.BiosVersion || "N/A",
      model: systemData.Model || "N/A",
      powerState: systemData.PowerState || "N/A",
      cpu: {
        count: systemData.ProcessorSummary?.Count || "N/A",
        model: systemData.ProcessorSummary?.Model || "N/A"
      },
      memorySize: systemData.MemorySummary?.TotalSystemMemoryGiB || "N/A",
      chassis: chassis,
      nicDevices: nicDevices,
      otherPcieDevices:otherPcieDevices,
      disks: disks


    };
    const newPlanData = {
      ram: [{ ram: systemInfo.memorySize }],
      chassi: systemInfo.chassis.model,
      disks: [{ sdisk: systemInfo.disks }],
      cpu: [{ cpuname: `${systemInfo.cpu.count} X ${systemInfo.cpu.model}` }],
      nic: [{ nic: systemInfo.nicDevices }],
      pc: [{ pc: systemInfo.otherPcieDevices }],
    };
    console.log(systemInfo.name);
    updatePlan(iloip, newPlanData);
    return systemInfo;

  } catch (error) {
    logErrorToFile(iloip, `Login failed: ${error.message}`);
    console.error("An error occurred:", error.message);
    return null;
  } finally {
    if (authToken && sessionId) {
      // Logout from iLO
      try {
        await instance.delete(`${sessionId}`, {
          headers: { "X-Auth-Token": authToken }
        });
        console.log("Logged out of iLO session.");
      } catch (logoutError) {
        logErrorToFile(iloip, `Logout failed: ${logoutError.message}`);
        console.error("Failed to log out:", logoutError.response ? logoutError.response.data : logoutError.message);
      }
    }
  }


}

// // Example: Use the data in another function
// async function main() {
//   const iloData = await getILOData('80.83.91.85');
//   if (iloData) {
//     console.log("ILO Server Info:", iloData);

//     // Example: Accessing values directly
//     console.log(`Server Name: ${iloData.name}`);
//     console.log(`BIOS Version: ${iloData.biosVersion}`);
//     console.log(`CPU: ${iloData.cpu.count}x ${iloData.cpu.model}`);
//     console.log(`Memory Size: ${iloData.memorySize} GB`);
//     console.log(`Power State: ${iloData.powerState}`);
//     console.log(`Model: ${iloData.chassis.model}`);
//     console.log("PCIe Devices:", iloData.nicDevices.length > 0 ? iloData.nicDevices.join("\n") : "No PCIe devices found");
//     console.log("Disks:", iloData.disks.length > 0 ? iloData.disks.join(" + ") : "No disks found");
//   }
// }

// // Run the main function
// main();

