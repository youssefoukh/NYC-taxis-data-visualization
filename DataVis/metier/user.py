from DataVis.acces_donnees.acces_donnees_user import AccesDonneesUser


class User:
    def get_vote_year(self):
        return AccesDonneesUser().get_vote_year()
