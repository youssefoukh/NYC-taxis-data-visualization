from flask import Flask

app = Flask(__name__)
# this import was switched here to avoid import loops
from DataVis import urls
