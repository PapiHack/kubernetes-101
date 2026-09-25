# Lab 2 — Write a Dockerfile

Goal: containerize the Flask app in `../app/` **without looking at the provided Dockerfile** first.

1. Create a `Dockerfile` that:
   - starts from `python:3.12-slim`
   - sets `/app` as working directory
   - installs `requirements.txt` dependencies
   - copies the app code
   - runs `python app.py`
2. Build it: `docker build -t hello-k8s:1.0 .`
3. Run it: `docker run -d -p 5000:5000 hello-k8s:1.0` then `curl localhost:5000`
4. Bonus: run a second instance with `-e GREETING=Bonjour -p 5001:5000` — same image, different config. Keep this idea in mind for Session 3 (ConfigMaps).

Questions to reflect on:
- Why copy `requirements.txt` **before** the app code? (layer caching)
- What's the difference between `CMD` and `ENTRYPOINT`?

Solution: the reference `Dockerfile` sits in `../app/`.
