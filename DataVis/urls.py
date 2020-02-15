"""
this file is for attributing urls to actions
"""

from DataVis import app
from flask import render_template, jsonify
from DataVis.business.business_factory import BusinessFactory


@app.route('/')
@app.route('/SO10')
def index():
    return render_template('so10.html')


@app.route("/SO10/data")
def reputation_year():
    return jsonify(BusinessFactory.get_business_user().get_reputation_year(36))
