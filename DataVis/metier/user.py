from DataVis.acces_donnees.acces_donnees_user import AccesDonneesUser


class User:
    def get_reputation_year(self, id):
        """ this class given an id of a user get all his posts via the method get_post(id : int) then it loops through
        the post and each post gives its id fo another method called get_votes(post_id : int) then using all  post's
        votes we calculate the reputation gained and added to a dictionary in which the keys are the creation date of
        the post and the value is the reputation gained by that post """
        rep_gained = 1
        list_reputation = {}
        for post in AccesDonneesUser().get_posts(id):
            for vote in AccesDonneesUser().get_votes(post.Id):
                if vote.Id == 2:
                    rep_gained = rep_gained + 10
                elif vote.Id == 3:
                    if rep_gained - 2 >= 1:
                        rep_gained = rep_gained - 2
            list_reputation[post.CreationDate] = rep_gained
        return list_reputation
