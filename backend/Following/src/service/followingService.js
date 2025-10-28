const followingRepository = require('../repository/followingRepo');
const stakeholdersClient = require('../client/StakeholdersClient');

class FollowingService {

  async followUser(followerId, followedId) {
    console.log(`Započet zahtev za praćenje: followerId=${followerId}, followedId=${followedId}`);

    if (followerId === followedId) {
      console.error(`Greška: Korisnik (ID: ${followerId}) ne može sam sebe da prati.`);
      throw new Error('Korisnik ne može sam sebe da prati.');
    }

    console.log(`Provera postojanja korisnika: followerId=${followerId}, followedId=${followedId}`);
    const [followerExists, followedExists] = await Promise.all([
      stakeholdersClient.checkUserExistence(followerId),
      stakeholdersClient.checkUserExistence(followedId)
    ]);

    if (!followerExists) {
      console.error(`Greška: Korisnik koji pokušava da prati (ID: ${followerId}) ne postoji.`);
      throw new Error(`Korisnik koji pokušava da prati (ID: ${followerId}) ne postoji.`);
    }
    if (!followedExists) {
      console.error(`Greška: Korisnik koji treba da bude zapraćen (ID: ${followedId}) ne postoji.`);
      throw new Error(`Korisnik koji treba da bude zapraćen (ID: ${followedId}) ne postoji.`);
    }
    console.log('Oba korisnika postoje.');

    try {
      console.log(`Pokušaj upisa praćenja u bazu: followerId=${followerId}, followedId=${followedId}`);
      await followingRepository.followUser(followerId, followedId);
      console.log(`Uspešno zapraćen korisnik: followerId=${followerId} -> followedId=${followedId}`);
      return { success: true };
    } catch (error) {
      console.error(`Greška prilikom upisa u bazu za praćenje: ${error}`);
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

    console.log(`Dobavljanje preporučenih ID-jeva za korisnika (ID: ${userId}) iz repozitorijuma.`);
    const recommendedIds = await followingRepository.getRecommendation(userId);
    if (!recommendedIds || recommendedIds.length === 0) {
      console.log(`Nema preporučenih ID-jeva iz repozitorijuma za korisnika (ID: ${userId}).`);
      return [];
    }

    console.log(`Dobijeno ${recommendedIds.length} preporučenih ID-jeva iz repozitorijuma.`);

    const profilePromises = recommendedIds.map(id => {
      console.log(`Dobavljanje profila za preporučenog korisnika (ID: ${id})`);
      return stakeholdersClient.getUserByUserId(id);
    });

    const recommendedUsers = await Promise.all(profilePromises);

    // Filtriramo null vrednosti koje mogu doći iz klijent servisa
    const finalUsers = recommendedUsers.filter(user => user !== null);

    console.log(`Dobijeno ${finalUsers.length} validnih korisničkih profila iz klijent servisa.`);

    console.log(`Završen proces preporuka za korisnika (ID: ${userId}).`);
    return finalUsers;
  }

  async getFollowingsForUser(userId) {
    console.log(`Započeto dobavljanje liste praćenja za korisnika (ID: ${userId})`);

    const userExists = await stakeholdersClient.checkUserExistence(userId);
    if (!userExists) {
      console.error(`Greška: Korisnik (ID: ${userId}) ne postoji.`);
      throw new Error(`Korisnik (ID: ${userId}) ne postoji.`);
    }
    console.log(`Korisnik (ID: ${userId}) postoji. Nastavak dobavljanja praćenja.`);

    const followingIds = await followingRepository.getFollowing(userId);
    if (!followingIds || followingIds.length === 0) {
      console.log(`Korisnik (ID: ${userId}) ne prati nikoga.`);
      return [];
    }

    console.log(`Korisnik (ID: ${userId}) prati ${followingIds.length} korisnika.`);
    console.log(`Završeno dobavljanje liste praćenja za korisnika (ID: ${userId})`);
    return followingIds;
  }

  async followExists(followerId, followedId) {
    console.log(`Započeta provera da li praćenje postoji: followerId=${followerId}, followedId=${followedId}`);

    if (followerId === followedId) {
      console.error(`Greška: Korisnik (ID: ${followerId}) ne može sam sebe da prati.`);
      throw new Error('Korisnik ne može sam sebe da prati.');
    }

    console.log(`Provera postojanja korisnika: followerId=${followerId}, followedId=${followedId}`);
    const [followerExists, followedExists] = await Promise.all([
      stakeholdersClient.checkUserExistence(followerId),
      stakeholdersClient.checkUserExistence(followedId)
    ]);

    if (!followerExists) {
      console.error(`Greška: Korisnik koji treba da prati (ID: ${followerId}) ne postoji.`);
      throw new Error(`Korisnik koji treba da prati (ID: ${followerId}) ne postoji.`);
    }
    if (!followedExists) {
      console.error(`Greška: Korisnik koji treba da je zapraćen (ID: ${followedId}) ne postoji.`);
      throw new Error(`Korisnik koji treba da je zapraćen (ID: ${followedId}) ne postoji.`);
    }
    console.log('Oba korisnika postoje. Provera praćenja u repozitorijumu.');

    const res = await followingRepository.checkIfFollows(followerId, followedId);
    console.log(`Rezultat provere praćenja: ${res}`);
    console.log(`Završena provera praćenja: followerId=${followerId}, followedId=${followedId}`);
    return res;
  }
}

module.exports = new FollowingService();