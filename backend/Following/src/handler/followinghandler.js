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
  }

};

module.exports = followingHandler;