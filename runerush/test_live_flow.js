const axios = require('axios');
require('dotenv').config();

const runTest = async () => {
  try {
    // Step 1: Simulate a purchase
    const purchaseResponse = await axios.post('https://runeflow.xyz/purchase', {
      product: 'pro_bundle'  // Change as needed
    });
    console.log('Purchase Response:', purchaseResponse.data);

    // Step 2: Retrieve license key from response
    const { sessionId } = purchaseResponse.data;

    // Step 3: Validate the license key
    const validateResponse = await axios.get(`https://runeflow.xyz/validate?session_id=${sessionId}`);
    console.log('Validation Response:', validateResponse.data);

    // Step 4: Retrieve the download URL
    const { licenseKey } = validateResponse.data;
    const downloadResponse = await axios.get(`https://runeflow.xyz/download?key=${licenseKey}`);
    console.log('Download Response:', downloadResponse.data);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

runTest();

