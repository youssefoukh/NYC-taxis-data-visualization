class User:
    """this class will serve to handle all the business logic to manage communication between the presentation layer
    and the persistence layer """

    def __init__(self, dao):
        self._dao = dao

    def get_reputation_year(self, id):
        """ this method given an id of a user get all his posts via the method get_post(id : int) then it loops
        through the post and each post gives its id to another method called get_votes(post_id : int) then using all
        post's votes we calculate the reputation gained and using that information along with the creation date of the
        post we store it to a dictionary ( keys(date,reputation) => values(creation date of the post, reputation
        calculated of the post)) then we add dictionary to a list """
        rep_gained = 1
        list_reputation = []
        for post in self._dao.get_posts(id):
            for vote in self._dao.get_votes(post.Id):
                if vote.Id == 2:
                    rep_gained = rep_gained + 10
                elif vote.Id == 3:
                    if rep_gained - 2 >= 1:
                        rep_gained = rep_gained - 2
            list_reputation.append(dict(
                date=post.CreationDate.strftime("%d %b, %Y"),
                reputation=rep_gained
            ))
        return list_reputation
