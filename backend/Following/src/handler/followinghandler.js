const followingService = require('../service/followingService');

const followingHandler = {
  followUser: async (call, callback) => {
    console.log('--- Pokrenut `followUser` handler ---');
    try {
      const { followerId, followedId } = call.request;
      console.log(`Request podaci: followerId=${followerId}, followedId=${followedId}`);
      
      const result = await followingService.followUser(followerId, followedId);

      console.log('Servis je uspešno obradio praćenje. Šaljem odgovor klijentu.');
      callback(null, { status: 'SUCCESS', message: result.message });

    } catch (error) {
      console.error("Greška u `followUser` handleru:", error.message);
      callback({
        code: 5, // NOT_FOUND ili neki drugi odgovarajući kod
        message: error.message
      }, null);
    }
  },

  followExists: async (call, callback) => {
    console.log('--- Pokrenut `followExists` handler ---');
    try {
      const { followerId, followedId } = call.request;
      console.log(`Request podaci: followerId=${followerId}, followedId=${followedId}`);
      
      const doesExist = await followingService.followExists(followerId, followedId);
      
      console.log(`Provera praćenja uspešna. Rezultat: ${doesExist}. Šaljem odgovor klijentu.`);
      callback(null, { exists: doesExist });

    } catch (error) {
      console.error("Greška u `followExists` handleru:", error.message);
      callback({
        code: 13, // INTERNAL
        message: `Došlo je do greške prilikom provere veze: ${error.message}`
      }, null);
    }
  },

  getRecommendations: async (call, callback) => {
    console.log('--- Pokrenut `getRecommendations` handler ---');
    try {
      const { userId } = call.request;
      console.log(`Request podaci: userId=${userId}`);

      const profiles = await followingService.getRecommendations(userId);
      
      console.log(`Uspešno dobavljene preporuke. Broj profila: ${profiles.length}. Šaljem odgovor klijentu.`);
      callback(null, { users: profiles });
    } catch (error) {
      console.error("Greška u `getRecommendations` handleru:", error.message);
      callback({
        code: 5, // NOT_FOUND
        message: error.message
      }, null);
    }
  },

  GetFollowingsForUser: async (call, callback) => {
    console.log('--- Pokrenut `GetFollowingsForUser` handler ---');
    try {
      const { id } = call.request;
      console.log(`Request podaci: id=${id}`);

      const followingIds = await followingService.getFollowingsForUser(id);

      console.log(`Uspešno dobavljena lista praćenja. Broj ID-jeva: ${followingIds.length}. Šaljem odgovor klijentu.`);
      callback(null, { ids: followingIds });

    } catch (error) {
      console.error("Greška u `GetFollowingsForUser` handleru:", error.message);
      callback({
        code: 5, // NOT_FOUND
        message: error.message
      }, null);
    }
  }

};

module.exports = followingHandler;