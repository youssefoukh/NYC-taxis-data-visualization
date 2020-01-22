"""
this file is for attributing urls to actions
"""

from DataVis import app
from flask import render_template, jsonify
from DataVis.metier.user import User


@app.route('/')
@app.route('/SO10')
def index():
    return render_template('so10.html', list_rep=User().get_reputation_year(2))


@app.route("/SO10/data")
def reputation_year():
    return jsonify(User().get_reputation_year(2))
