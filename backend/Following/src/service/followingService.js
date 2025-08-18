const followingRepository = require('../repository/followingRepo');
const stakeholdersClient = require('../client/StakeholdersClient'); 

class FollowingService {

  async followUser(followerId, followedId) {

    if (followerId === followedId) {
      throw new Error('Korisnik ne može sam sebe da prati.');
    }

    const [followerExists, followedExists] = await Promise.all([
      stakeholdersClient.checkUserExistence(followerId),   
      stakeholdersClient.checkUserExistence(followedId)    
    ]);

    if (!followerExists) {
      throw new Error(`Korisnik koji pokušava da prati (ID: ${followerId}) ne postoji.`);
    }
    if (!followedExists) {
      throw new Error(`Korisnik koji treba da bude zapraćen (ID: ${followedId}) ne postoji.`);
    }

    try {
      await followingRepository.followUser(followerId, followedId);
      return { success: true};
    } catch (error) {
      throw new Error('Došlo je do greške prilikom upisa u bazu.' + error);
    }
  }

  async getRecommendations(userId) { 
    const userExists = await stakeholdersClient.checkUserExistence(userId);
    if (!userExists) {
      throw new Error(`Korisnik (ID: ${userId}) ne postoji.`);
    }

    const recommendedIds = await followingRepository.getRecommendation(userId);
    if (!recommendedIds || recommendedIds.length === 0) {
      return [];
    }
    const profilePromises = recommendedIds.map(id => {
      return stakeholdersClient.getProfileByUserId(id);
    });

    const recommendedProfiles = await Promise.all(profilePromises);
    const finalProfiles = recommendedProfiles.filter(profile => profile !== null);
    return finalProfiles;
  }
}

module.exports = new FollowingService();