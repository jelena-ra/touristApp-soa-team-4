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

  async getRecommendation(userId) { 
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (me:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(fof:User) WHERE NOT (me)-[:FOLLOWS]->(fof) AND me <> fof RETURN fof, COUNT(*) AS score ORDER BY score DESC LIMIT 10',
        { userId: userId }
      );

      const recommendations = result.records.map(record => {
        const fofNode = record.get('fof');
        return fofNode.properties.id;
      });

      return recommendations;

    } catch (error) {
      console.error('Greška pri dohvatanju preporuka iz baze:', error);
      throw error; 
    } finally {
      await session.close();
    }
  }

  async getFollowing(userId) {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (me:User {id: $userId})-[:FOLLOWS]->(followed:User) RETURN followed',
        { userId: userId }
      );

      const following = result.records.map(record => {
        const followedNode = record.get('followed');
        return followedNode.properties.id; 
      });

      return following;
    } catch (error) {
      console.error('Greška pri dohvatanju following liste iz baze:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


}

module.exports = new FollowingRepository();