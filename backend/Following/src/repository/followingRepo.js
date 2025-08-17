const driver = require('../config/db');

class FollowingRepository {

  async followUser(followerId, followedId) {
    const session = driver.session();
    try {
      await session.run(
        'MERGE (follower:User {id: $followerId}) MERGE (followed:User {id: $followedId}) MERGE (follower)-[:FOLLOWS]->(followed)',
        { followerId: followerId, followedId: followedId }
      );
      console.log(`Uspešno kreirana veza: ${followerId} prati ${followedId}`);
    } catch (error) {
      console.error('Greška pri kreiranju veze:', error);
    } finally {
      await session.close();
    }
  }

}

module.exports = new FollowingRepository();