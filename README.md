# Math 3800 Arcade (local copy)

Tap-to-answer game for Math 3800 Test 2. Questions come from a read-only bundle of the
MathReps Test 2 generators (`engine.js`).

Run it (also reachable from a tablet on the same Wi-Fi):

    cd ~/Projects/3_School/math3800-arcade
    python3 serve.py

then open http://localhost:8380 here, or http://<this computer's IP>:8380 on the tablet.
serve.py tells browsers not to keep stale copies, so updates show up on a refresh.
Progress is saved in each browser only. Add #pen to the address for the S Pen check box.
