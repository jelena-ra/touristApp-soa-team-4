const followingRepository = require('../repository/followingRepo');

class FollowingService {

  async followUser(followerId, followedId) {
    console.log(`Servisni sloj: Provera za praćenje korisnika ${followerId} -> ${followedId}`);

    if (followerId === followedId) {
      throw new Error('Korisnik ne može sam sebe da prati.');
    }

    try {
      await followingRepository.followUser(followerId, followedId);

      return { success: true};

    } catch (error) {
      console.error("Greška:", error);
      throw new Error('Došlo je do greške prilikom upisa u bazu.');
    }
  }

}

module.exports = new FollowingService();