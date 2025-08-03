from flask import Flask, render_template, request, jsonify
import datetime
import json
import os

app = Flask(__name__)
DATA_FILE = "reminders.json"

def load_reminders():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {}

def save_reminders(reminders):
    with open(DATA_FILE, "w") as f:
        json.dump(reminders, f, indent=4)

@app.route("/")
def index():
    today = datetime.date.today()
    return render_template("index.html", year=today.year, month=today.month)

@app.route("/api/reminders", methods=["GET", "POST", "DELETE"])
def reminders_api():
    reminders = load_reminders()
    if request.method == "GET":
        return jsonify(reminders)
    
    data = request.json
    date_key = data["date"]

    if request.method == "POST":
        text = data["text"]
        reminders.setdefault(date_key, []).append(text)
        save_reminders(reminders)
        return jsonify({"status": "success"})

    if request.method == "DELETE":
        index = data["index"]
        if date_key in reminders and 0 <= index < len(reminders[date_key]):
            reminders[date_key].pop(index)
            if not reminders[date_key]:
                del reminders[date_key]
            save_reminders(reminders)
            return jsonify({"status": "deleted"})
        return jsonify({"status": "error"})

if __name__ == "__main__":
    app.run(debug=True)
