# Bonus — Make the data survive

**Optional.** Do this if you finished Lab 2 early, or at home — Session 3's storage lab assumes
the idea. Ten minutes, four steps, no app to write.

Goal: see for yourself that a container's filesystem dies with it, then fix that with a volume.

## 1. Write a file, throw the container away

```bash
docker run --name box1 alpine sh -c 'mkdir -p /data && echo "I was here" > /data/note.txt && cat /data/note.txt'
docker rm box1

# a fresh container from the same image:
docker run --rm alpine cat /data/note.txt
```

The last command fails with `No such file or directory`. That is the whole lesson — the second
container is **not** the first one restarted, it is a new one built from the same image, and the
image never had your file. The writable layer went in the bin with `box1`.

## 2. Same thing, with a volume

```bash
docker volume create lab-data
docker run --rm -v lab-data:/data alpine sh -c 'echo "I was here" > /data/note.txt'

# a different container, minutes later:
docker run --rm -v lab-data:/data alpine cat /data/note.txt
```

Note `--rm`: both containers were deleted the moment they exited, and the file is still there.
The volume is not inside the container — the container just mounts it.

## 3. A bind mount: your own folder, live in the container

```bash
cd session-1-containers
docker run --rm -v "$(pwd)/app":/src alpine ls /src
```

Now edit `app/app.py` on your machine — change the greeting — and run it again:

```bash
docker run --rm -v "$(pwd)/app":/src alpine cat /src/app.py
```

Your change is there, with no rebuild. That is the edit-and-reload dev loop.

## 4. Clean up

```bash
docker volume ls
docker volume rm lab-data
```

**Checkpoint:** you can say, in one sentence each, why step 1 failed and why step 2 didn't.

**If stuck:** on Windows, `$(pwd)` is a shell-ism — use PowerShell's `${PWD}` or run it from Git
Bash / WSL. If `docker volume rm` says the volume is in use, `docker ps -a` will show the
container still holding it.

## Questions to reflect on

- What happens to a **named** volume when you `docker rm` the container using it? (Nothing. But
  `--rm` does delete *anonymous* volumes — the ones you get from `-v /data` with no name.)
- Which would you reach for to store a database's files? To work on source code?
- `docker run -v app-data:/data` and `docker run -v "$(pwd)":/data` look almost identical. What
  tells Docker which one you meant?

📖 [Volumes](https://docs.docker.com/engine/storage/volumes/) ·
[Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)

> Session 3 does this one level up: a Pod's filesystem dies with the Pod, and a
> **PersistentVolumeClaim** is how you ask Kubernetes for storage that doesn't.
