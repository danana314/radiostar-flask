from flask import Flask, render_template, request, jsonify
import parser

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/parse', methods=['POST'])
def parse_url():
  url = request.form['url']
  parsed = parser.parse_feed(url)
  return jsonify(titles=parsed[0], descriptions=parsed[1], links=parsed[2])

if __name__ == '__main__':
    app.run(debug=True)
