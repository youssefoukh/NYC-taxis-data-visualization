from DataVis import app
from flask import render_template
from DataVis.metier.user import User


@app.route('/')
@app.route('/SO10')
def index():
    return render_template('so10.html', list_post=User().get_vote_year())
