const axios = require('axios');

const STAKEHOLDERS_API_URL = 'http://localhost:8081';

const stakeholdersClient = {
  async checkUserExistence(userId) {
    try {
      await axios.get(`${STAKEHOLDERS_API_URL}/exists/${userId}`);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false; 
      }
      console.error(`Greška pri komunikaciji sa Stakeholders servisom za korisnika ${userId}:`, error.message);
      throw new Error('Stakeholders servis nije dostupan ili je došlo do greške.');
    }
  }
};

module.exports = stakeholdersClient;