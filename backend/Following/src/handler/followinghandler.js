const followingService = require('../service/followingService');

const followingHandler = {
  followUser: async (call, callback) => {
    try {
      const { followerId, followedId } = call.request;
      
      const result = await followingService.followUser(followerId, followedId);

      callback(null, { status: 'SUCCESS', message: result.message });

    } catch (error) {
      console.error("Greška u handleru:", error.message);
      callback({
        code: 5, 
        message: error.message
      }, null);
    }
  },

  getRecommendations: async (call, callback) => {
    try {
      const { userId } = call.request;
      console.log(`Handler je primio zahtev za preporuke za korisnika: ${userId}`);

      // 2. Čekamo (await) da servis završi svoj posao i vrati nam listu profila
      const profiles = await followingService.getRecommendations(userId);

      // 3. Ako je sve prošlo bez greške, pozivamo callback da pošaljemo uspešan odgovor
      //    Odgovor je objekat sa ključem 'profiles', kako je definisano u .proto fajlu
      callback(null, { profiles: profiles });

    } catch (error) {
      // Ako se desi greška u 'await' liniji iznad, kod skače direktno ovde
      console.error("Greška u handleru prilikom dohvatanja preporuka:", error.message);
      callback({
        code: 5,
        message: error.message
      }, null);
    }
  }

};

module.exports = followingHandler;