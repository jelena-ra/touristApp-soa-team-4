// 1. ISPRAVNA PUTANJA (relativna)
const followingRepository = require('../repository/followingRepository');
const stakeholdersClient = require('../client/StakeholdersClient'); 

class FollowingService {

  async followUser(followerId, followedId) {
    console.log(`Servisni sloj: Zahtev za praćenje ${followerId} -> ${followedId}`);

    if (followerId === followedId) {
      throw new Error('Korisnik ne može sam sebe da prati.');
    }

    console.log('Provera postojanja korisnika u Stakeholders servisu...');
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
}

module.exports = new FollowingService();