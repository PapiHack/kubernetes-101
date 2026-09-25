# Session 1 — Containers: The Foundations (2h)

**Slides:** [`slides/theory.html`](slides/theory.html) — open in a browser (← → to navigate, `N` for speaker notes, Ctrl/Cmd+P to export a PDF).

**By the end of this session you can:** explain why containers exist; tell an image from a container; read and write a simple Dockerfile; build, run and inspect your own container.

## Theory (45 min)
- Why containers? The "it works on my machine" problem — VMs vs containers, isolation, namespaces/cgroups at a high level
  📖 [What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)
- Images vs containers, layers and the build cache, the concept of a registry (Docker Hub)
  📖 [What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/) · [Docker Hub](https://docs.docker.com/docker-hub/)
- Anatomy of a Dockerfile: `FROM`, `COPY`, `RUN`, `CMD`/`ENTRYPOINT` — and the `RUN` (build time) vs `CMD` (start time) distinction
  📖 [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) · [Dockerfile concepts](https://docs.docker.com/build/concepts/dockerfile/)
- `docker build` / `docker run`, and port publishing with `-p` (no `-p` → unreachable, the classic Lab 1 moment)
- **How the build works**: the context goes to the builder, which runs the instructions in order, one layer per step — show a second build finishing almost entirely `CACHED`
- **The build context**: that trailing `.` is a whole folder, shipped *before* any instruction runs. Why `.git/` makes builds crawl, and why a stray `.env` is one `COPY . .` away from living in the image. `.dockerignore` fixes both
  📖 [Build context](https://docs.docker.com/build/concepts/context/)
- The ten instructions they will actually use, split build-time (`FROM`, `WORKDIR`, `COPY`, `RUN`, `ARG`) vs run-time (`CMD`, `ENTRYPOINT`, `ENV`, `USER`, `EXPOSE`) — a slide to photograph, not to recite. `EXPOSE` documents a port and publishes nothing
- Then one slide per confusing pair (1 min each): `COPY` vs `ADD` (remote URLs, silent tar extraction → use COPY) · `CMD` vs `ENTRYPOINT` (args replace CMD but are appended to ENTRYPOINT; K8s calls them `args:` / `command:`) · `ARG` vs `ENV` (build-only vs baked in) — closing on the warning that neither hides a secret, since `docker history` reads both
- **Volumes**: the writable layer dies with the container — a fresh container from the same image never sees what the last one wrote. A **named volume** (`-v app-data:/data`) lives beside the container and outlives it; a **bind mount** (`-v "$(pwd)":/app`) puts your own folder inside it, which is the edit-and-reload dev loop, not a production pattern. Sets up Session 3's PersistentVolumeClaim
  📖 [Volumes](https://docs.docker.com/engine/storage/volumes/) · [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- Good habits: small base images, no secrets in images, `.dockerignore`, log to stdout

## Hands-on (1h15)

### Lab 1 — Run an existing image (20 min)
```bash
docker run -d --name web -p 8080:80 nginx
curl http://localhost:8080
docker logs web
docker exec -it web sh        # look around, then exit
docker stop web && docker rm web
```

**Checkpoint:** `curl http://localhost:8080` returns the nginx page.
**If stuck:** port 8080 already taken → use `-p 8081:80`.

### Lab 2 — Write a Dockerfile (40 min)
Containerize the small Flask app in [`app/`](app/). Instructions in [`exercises/01-lab-2-dockerfile.md`](exercises/01-lab-2-dockerfile.md).

**Checkpoint:** `docker build -t hello-k8s:1.0 app/` succeeds and the container answers on port 5000.
**If stuck (5-min rule):** a working `Dockerfile` is already in [`app/`](app/) — use it, build, and move on. Read the diff against your own attempt during the closing discussion; the goal is a running image, not a perfect first Dockerfile.

#### Bonus — make the data survive (optional, ~10 min)
For anyone who finishes early; everyone else can do it at home. Four steps that prove a
container's filesystem dies with it, then fix it with a volume and a bind mount:
[`exercises/02-bonus-volumes.md`](exercises/02-bonus-volumes.md).

**Checkpoint:** you can say in one sentence why a fresh container can't see the file the last one wrote.
There is no fixed slot for this — it must not eat into Lab 3 or the closing discussion.

### Lab 3 — Build & tag (10 min, incl. instructor push demo)
Students build and run the image — that's all the course needs (later sessions load it directly into the local cluster):
```bash
docker build -t hello-k8s:1.0 app/
docker run -d -p 5000:5000 hello-k8s:1.0
```
The tag + push to Docker Hub is an **instructor demo only** (no student accounts, no registry auth on the clock):
```bash
docker tag hello-k8s:1.0 <your-dockerhub-user>/hello-k8s:1.0
docker push <your-dockerhub-user>/hello-k8s:1.0
```

**Checkpoint (required for Sessions 2–4):** `docker images | grep hello-k8s` shows `hello-k8s:1.0`.
**If stuck:** you can rebuild it at any time from the reference `app/` folder — Sessions 2–3 also work with the public `nginx` image if the build still fails.

### Closing discussion (5 min)
The limits: what if I have **50 containers across 10 machines**? Who restarts them, spreads them, connects them? → teaser for Kubernetes.

## Go deeper on your own

1. [Docker concepts — the basics](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) — start here, ~15 min
2. [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — skim once, then keep as a lookup
3. [Building images: best practices](https://docs.docker.com/build/concepts/dockerfile/) — when your builds feel slow
4. [`docker run` reference](https://docs.docker.com/reference/cli/docker/container/run/) — every flag you will meet

> Habit to build now: `docker <command> --help` answers most questions faster than a web search.
