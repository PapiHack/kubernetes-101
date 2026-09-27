# Lab 2 — Your container, now in a Pod

**30 minutes.** Goal: take the image *you* built in Session 1 and hand it to a cluster —
then discover, on purpose, what a bare Pod refuses to do for you.

This is the lab slide 8 of the deck promises: same image, same process, nothing about the
container had to be adapted for Kubernetes. What changes is *who decides* where it runs.

---

## 0. Put your image inside the cluster (5 min)

Your cluster's nodes are containers themselves. They cannot see the images on your laptop, so
an image that `docker images` lists is still invisible to Kubernetes until you load it.

```bash
# from the repo root
docker build -t hello-k8s:1.0 session-1-containers/app

kind load docker-image hello-k8s:1.0 --name k8s101
# k3d instead of kind:
#   k3d image import hello-k8s:1.0 -c k8s101
```

📖 [Loading an image into your cluster](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster)
· [k3d image import](https://k3d.io/stable/usage/commands/k3d_image_import/)

**Checkpoint:** the load command finishes without an error.

**If stuck (5-minute rule):** you do not need your own image to learn Pods. Edit
`manifests/01-pod.yaml`, change the image to `nginx:1.27` and the port to `80`, and carry on —
everything below works unchanged. Catch the build up at home.

> **On Killercoda** there is no local image to load. Either build it there
> (`git clone` the repo first) or use the `nginx:1.27` fallback above.

---

## 1. Create the Pod (5 min)

Read [`../manifests/01-pod.yaml`](../manifests/01-pod.yaml) before you apply it. Four top-level
keys, exactly as on slide 9 — `apiVersion`, `kind`, `metadata`, `spec` — and `containers` is a
**list**, which is what the `-` is doing.

```bash
kubectl apply -f manifests/01-pod.yaml
kubectl get pods
```

Run `kubectl get pods` twice, quickly. The first run may say `ContainerCreating` and the second
`Running` — that gap is slide 7's point made real: `apply` returning "created" means your
manifest was **stored**, not that anything is running yet.

**Checkpoint:** `kubectl get pods` shows `hello-pod` as `Running`, `READY 1/1`.

**If stuck:** `ErrImageNeverPull` or `ImagePullBackOff` means step 0 didn't take — the cluster
is looking for an image it hasn't got. Re-run the `kind load` / `k3d image import`, then
`kubectl delete pod hello-pod` and apply again.

---

## 2. The three commands you will use forever (10 min)

Always in this order. Slide 18 is this list; the official debugging guide opens the same way —
*"The first step in debugging a Pod is taking a look at it."*

```bash
kubectl get pod hello-pod              # what state?
kubectl describe pod hello-pod         # what do the EVENTS say?  (scroll to the bottom)
kubectl logs hello-pod                 # what does the app itself say?
```

In the `describe` output, find these three things and say what each one means out loud:

- the **Node:** line — which worker got it, and who decided that (slide 6's scheduler)
- the **IP:** line — the Pod's own IP, not the node's
- the **Events** at the bottom — `Scheduled` → `Pulled` → `Created` → `Started`. That is
  slide 7's five-step journey, printed in your terminal.

Now get inside it and call the app the way nothing outside the cluster can yet:

```bash
kubectl exec -it hello-pod -- sh
# inside:
wget -qO- http://localhost:5000
exit
```

That reply comes from *your* Flask app — the hostname it prints is the Pod's name. Note that
you had to be **inside** to reach it: the Pod has an IP, but nothing routes to it from outside.
That is precisely the hole Session 3 fills with a Service.

**Checkpoint:** you saw your own greeting, with the Pod's hostname in it.

**If stuck:** `kubectl logs hello-pod` shows the Flask startup lines. If `exec` refuses,
`kubectl describe pod hello-pod` and read the Events — the container may have restarted.

📖 [Debugging Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/)

---

## 3. The deliberate disappointment (5 min)

```bash
kubectl delete pod hello-pod
kubectl get pods
```

It is gone. Nothing brings it back, and nothing ever will.

Before the next lab, answer these in the chat:

1. **Who** would have had to recreate it? Nothing in `01-pod.yaml` states a desired number of
   copies, so no controller has an opinion about this Pod existing. There is no loop watching it.
2. If the **node** it was on had died instead of you deleting it, what would be different?
   (Nothing. Same outcome — the Pod dies with its node.)
3. You need three copies of this app. With only Pods, what do you type?

Question 3 is Lab 3.

**Checkpoint:** `kubectl get pods` is empty, and you can say in one sentence why nothing
recreated it.

---

## Bonus, if you are early

Write the Pod manifest again from scratch, without copying — use the API itself as the
documentation:

```bash
kubectl explain pod.spec.containers
kubectl apply --dry-run=client -f my-pod.yaml   # validates without creating anything
```

`--dry-run=client` is the habit worth building: it catches your YAML mistakes before the cluster
ever sees them.
