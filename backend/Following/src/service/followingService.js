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
  console.log(`Započinjanje procesa preporuka za korisnika (ID: ${userId})`);

  const userExists = await stakeholdersClient.checkUserExistence(userId);
  if (!userExists) {
    console.error(`Greška: Korisnik (ID: ${userId}) ne postoji.`);
    throw new Error(`Korisnik (ID: ${userId}) ne postoji.`);
  }

  const recommendedIds = await followingRepository.getRecommendation(userId);
  if (!recommendedIds || recommendedIds.length === 0) {
    console.log(`Nema preporučenih ID-jeva iz repozitorijuma za korisnika (ID: ${userId}).`);
    return [];
  }

  console.log(`Dobijeno ${recommendedIds.length} preporučenih ID-jeva iz repozitorijuma.`);

  const profilePromises = recommendedIds.map(id => {
    return stakeholdersClient.getUserByUserId(id);
  });

  const recommendedUsers = await Promise.all(profilePromises);

  // Filtriramo null vrednosti koje mogu doći iz klijent servisa
  const finalUsers = recommendedUsers.filter(user => user !== null);

  console.log(`Dobijeno ${finalUsers.length} validnih korisničkih profila iz klijent servisa.`);

  console.log(`Završen proces preporuka za korisnika (ID: ${userId}).`);
  return finalUsers;
}

  async getFollowingsForUser(userId){
    const userExists = await stakeholdersClient.checkUserExistence(userId);
    if (!userExists) {
      throw new Error(`Korisnik (ID: ${userId}) ne postoji.`);
    }

    const followingIds = await followingRepository.getFollowing(userId);
    if (!followingIds || followingIds.length === 0) {
      return [];
    }
    return followingIds;
  }

  async followExists(followerId, followedId){
    if (followerId === followedId) {
      throw new Error('Korisnik ne može sam sebe da prati.');
    }

    const [followerExists, followedExists] = await Promise.all([
      stakeholdersClient.checkUserExistence(followerId),   
      stakeholdersClient.checkUserExistence(followedId)    
    ]);

    if (!followerExists) {
      throw new Error(`Korisnik koji treba da prati (ID: ${followerId}) ne postoji.`);
    }
    if (!followedExists) {
      throw new Error(`Korisnik koji treba da je zapraćen (ID: ${followedId}) ne postoji.`);
    }

    const res = followingRepository.checkIfFollows(followerId, followedId)
    return res
  }
}

module.exports = new FollowingService();