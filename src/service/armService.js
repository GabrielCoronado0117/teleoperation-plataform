// src/service/armService.js
const ARM_API_URL = 'http://192.168.10.141:8079';

export const sendArmCommand = async (position) => {
  try {
    const response = await fetch(`${ARM_API_URL}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(position)
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending arm command:', error);
    throw error;
  }
};

export const getArmStatus = async () => {
  try {
    const response = await fetch(`${ARM_API_URL}/status`);
    return await response.json();
  } catch (error) {
    console.error('Error getting arm status:', error);
    throw error;
  }
};