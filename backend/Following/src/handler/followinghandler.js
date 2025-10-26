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

  followExists: async (call, callback) => {
    try {
      const { followerId, followedId } = call.request;
      
      const doesExist = await followingService.followExists(followerId, followedId);
      
      callback(null, { exists: doesExist });

    } catch (error) {
      console.error("Greška u handleru:", error.message);
      callback({
        code: 13, 
        message: `Došlo je do greške prilikom provere veze: ${error.message}`
      }, null);
    }
  },

  getRecommendations: async (call, callback) => {
    try {
      const { userId } = call.request;

      const profiles = await followingService.getRecommendations(userId);
      callback(null, { users: profiles });
    } catch (error) {
      console.error("Greška u handleru prilikom dohvatanja preporuka:", error.message);
      callback({
        code: 5,
        message: error.message
      }, null);
    }
  },

  GetFollowingsForUser: async (call, callback) => {
    try {
      const { id } = call.request;

      const followingIds = await followingService.getFollowingsForUser(id);

      callback(null, { ids: followingIds });

    } catch (error) {
      console.error("Greška u handleru prilikom dohvatanja preporuka:", error.message);
      callback({
        code: 5,
        message: error.message
      }, null);
    }
  }

};

module.exports = followingHandler;