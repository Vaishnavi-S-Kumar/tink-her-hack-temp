from flask import Flask, render_template, request, redirect, jsonify, session, url_for
import json
import os

app = Flask(__name__)
app.secret_key = "supersecretkey"   # Required for session

EVENTS_FILE = "events.json"

# Hardcoded Admin Credentials
ADMIN_USERNAME = "nv@gmail.com"
ADMIN_PASSWORD = "A1B2C3"

# Create file if not exists
if not os.path.exists(EVENTS_FILE):
    with open(EVENTS_FILE, "w") as f:
        json.dump({}, f)


def load_events():
    with open(EVENTS_FILE, "r") as f:
        return json.load(f)


def save_events(data):
    with open(EVENTS_FILE, "w") as f:
        json.dump(data, f, indent=4)


# Landing Page
@app.route("/")
def landing():
    return render_template("landing.html")


# User Calendar Page
@app.route("/calendar")
def calendar():
    return render_template("index.html")


# ------------------ LOGIN SYSTEM ------------------

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["admin_logged_in"] = True
            return redirect(url_for("admin"))
        else:
            return render_template("login.html", error="Invalid Username or Password")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("landing"))

#Deletion
@app.route("/delete-event", methods=["POST"])
def delete_event():
    if not session.get("admin_logged_in"):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    date = data["date"]
    index = data["index"]

    events = load_events()

    if date in events and 0 <= index < len(events[date]):
        events[date].pop(index)

        # Remove date key if no events left
        if len(events[date]) == 0:
            del events[date]

        save_events(events)
        return jsonify({"message": "Event Deleted"})

    return jsonify({"error": "Event Not Found"}), 400


# Admin Panel Page (PROTECTED)
@app.route("/admin")
def admin():
    if not session.get("admin_logged_in"):
        return redirect(url_for("login"))
    return render_template("admin.html")


# ------------------ EVENTS API ------------------

@app.route("/get-events")
def get_events():
    return jsonify(load_events())


@app.route("/add-event", methods=["POST"])
def add_event():
    if not session.get("admin_logged_in"):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    events = load_events()

    date = data["date"]
    new_event = {
        "name": data["name"],
        "link": data["link"]
    }

    if date not in events:
        events[date] = []

    events[date].append(new_event)
    save_events(events)

    return jsonify({"message": "Event Added"})


if __name__ == "__main__":
    app.run(debug=True)