# Session 2 — Kubernetes: Core Concepts (2h)

**Slides:** [`slides/theory.html`](slides/theory.html)

**By the end of this session you can:** say what Kubernetes is and what it is not; explain desired vs actual state and the reconciliation loop; name the pieces of a cluster and tell the control plane from the workers; describe what happens when you run `kubectl apply`; explain why a container runs inside a Pod and what a Pod alone cannot do; say why a Deployment exists (replicas, self-healing, rolling update, rollback); read a manifest (`apiVersion`/`kind`/`metadata`/`spec`); say what a namespace is and find objects in one; create and inspect a Pod, then a Deployment; use kubectl to see what is happening and why.

## Theory (45 min)

The deck follows this arc — each block builds on the previous one, and blocks 5–8 are the spine of the session.

1. **Recap** — Session 1's wall: containers solved packaging, you were still the orchestrator (1 min)
2. **What is Kubernetes** — one sentence, then each of last week's five pains answered; and what it is *not* (build system, PaaS, magic)
   📖 [What is Kubernetes?](https://kubernetes.io/docs/concepts/overview/)
3. **The one idea: declarative** — you declare *what*, not *how*; `docker run` vs `replicas: 3`
   📖 [Kubernetes objects](https://kubernetes.io/docs/concepts/overview/working-with-objects/)
4. **The reconciliation loop** — observe → compare → act, forever. Key concept, hammer it home
   📖 [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/)
5. **The cluster: a brain and some muscle** — control plane on top (API server, etcd, scheduler, controller manager, each its own colour) over the worker nodes (kubelet, kube-proxy, runtime, and the Pods). Trace the arrows rather than listing boxes: **everything goes through the API server** and nothing talks to anything else; etcd is drawn as a database because it is the only place state lives; the control plane hands work down to the kubelets. Say out loud that "master" is the older name, and that on kind both roles are the same machine — that is why `kubectl get nodes` may show one line
   📖 [Cluster components](https://kubernetes.io/docs/concepts/overview/components/) · [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/)
6. **What happens when you run `kubectl apply`** — the 5-step journey: kubectl → API server → etcd → scheduler → kubelet → status back. Lands two things: "created" means *stored*, not *running*; and nothing ever talks to a node directly
7. **From container to Pod** — the Session 1 `docker run` next to the same image as a Pod manifest. Kubernetes never runs a container on its own
   📖 [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
8. **The Pod, field by field, and what a Pod cannot do** — the manifest read in an editor with its parts framed: `apiVersion`/`kind`, `metadata` (name + labels), `spec`, and the `containers` **list** (the dash is the most common beginner error). The slide shows two containers so the manifest matches the drawing beside it: a main container and a sidecar, sharing one IP and reaching each other on `localhost`. One node, scheduled as a unit. Say plainly that every lab here is one container per Pod. Then the limits table (no restart, no copies, no rollout, no rollback, dies with its node) — the setup for Lab 2's deliberate disappointment. Plant the four-key shape here; block 10 comes back to `spec` vs `status` and to YAML itself
9. **Why a Deployment** — replicas, self-healing, rolling update with no downtime, rollback, node failure. Then Deployment → ReplicaSet → Pods, and the rolling-update picture (the old ReplicaSet is kept at 0 — that is why rollback is instant). Commands are Session 3's hands-on
   📖 [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)
10. **Reading a manifest** — `spec` (yours) vs `status` (the cluster's), now that block 8 has shown the shape; YAML indentation and `-` list items (budget 5 real minutes — the biggest beginner wall is YAML, not K8s). Show `kubectl explain pod.spec` and `kubectl apply --dry-run=client -f` here
11. **Labels are the glue** — selector and template labels must match (the #1 beginner bug, broken on purpose in Session 4)
    📖 [Labels and selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)
12. **Namespaces** — folders for objects: `default` (where their work lands), `kube-system` (the control plane, as ordinary Pods), any they create. Names unique *within* a namespace; not a security boundary by itself; DNS follows the split. Two minutes — it pays off immediately in Lab 1's `kubectl get pods -A`
    📖 [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
13. **kubectl: one pattern** — `get` → `describe` → `logs`, always in that order
    📖 [kubectl overview](https://kubernetes.io/docs/reference/kubectl/)

> Running late? Slides 2, 4, 12 and 18 are 30–60 second slides; shorten blocks 10 and 11 before touching anything else, and never skip the reconciliation loop.

## Hands-on (1h15)

### Lab 1 — Cluster check & explore (10 min)
The cluster install is **pre-work** ([`../docs/setup.md`](../docs/setup.md), done before the session — collect `kubectl get nodes` screenshots in the chat). Anyone still broken after 5 minutes of screen-share debugging switches to Killercoda. In session, just verify and explore:
```bash
kubectl get nodes
kubectl get pods -A          # every namespace — there's the control plane, in kube-system!
```

**Checkpoint:** `kubectl get nodes` shows at least one node `Ready`.
**If stuck:** open [Killercoda](https://killercoda.com/) and use it for the whole session — every lab below works there unchanged (except local image loading, see Lab 2).

### Lab 2 — Your container, now in a Pod (30 min)
The image from Session 1 (`hello-k8s:1.0`) goes into the cluster, becomes a Pod, gets inspected
with `get` → `describe` → `logs`, and then gets deleted and does not come back.
Instructions in [`exercises/01-lab-2-first-pod.md`](exercises/01-lab-2-first-pod.md).

Cluster nodes cannot see your laptop's images, so the lab opens by loading it:
```bash
docker build -t hello-k8s:1.0 session-1-containers/app
kind load docker-image hello-k8s:1.0 --name k8s101   # k3d: k3d image import hello-k8s:1.0 -c k8s101
```

**Checkpoint:** `kubectl get pods` showed `hello-pod` `Running` before you deleted it.
**If stuck (5-min rule):** `ErrImageNeverPull` / `ImagePullBackOff` means the load didn't take —
re-run it, delete the Pod and re-apply. Still broken after five minutes: edit
[`manifests/01-pod.yaml`](manifests/01-pod.yaml) to `nginx:1.27` on port `80` and carry on, the
whole lab works unchanged. On Killercoda there is no local image to load — use the same fallback.

### Lab 3 — Deployment + self-healing (35 min) — the "wow" moment
Same image, now with a controller watching it. Kill a Pod and watch the reconciliation loop put
it back. Instructions in [`exercises/02-lab-3-deployment.md`](exercises/02-lab-3-deployment.md).

Have them run `kubectl get pods -w` in a **second terminal before** deleting anything — the
instant recreation is the moment the whole course turns on.

**Checkpoint (required for Session 3):** `kubectl get deploy hello-deploy` shows the replicas
`READY`. Leave it running — Session 3 puts a Service in front of this exact Deployment.
**If stuck:** `kubectl delete deploy hello-deploy` then re-apply
[`manifests/02-deployment.yaml`](manifests/02-deployment.yaml). Session 3 re-applies it anyway,
so ending the session here costs you nothing.

#### Bonus — three broken manifests (optional, ~10 min)
For anyone who finishes early; everyone else can do it at home. One bug each, failing at three
different moments — `kubectl` before sending, the API server on validation, and nothing at all
until you read the Events: [`exercises/03-bonus-break-it.md`](exercises/03-bonus-break-it.md).

**Checkpoint:** you can say why `kubectl logs` was empty while the Pod still existed.
There is no fixed slot for this — it must not eat into Lab 3 or the closing discussion.

## Go deeper on your own

1. [Kubernetes Basics tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/) — the official interactive walkthrough; do this one first
2. [Pods](https://kubernetes.io/docs/concepts/workloads/pods/), then [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — the two pages worth reading properly
3. [Cluster components](https://kubernetes.io/docs/concepts/overview/components/) and [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/) — the control plane / worker split
4. [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/) — the reconciliation loop, properly
5. [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/) — bookmark it
6. [A visual guide on troubleshooting Kubernetes deployments](https://learnkube.com/troubleshooting-deployments) — keep the flowchart nearby

> `kubectl explain deployment.spec.strategy` is the documentation, in your terminal, offline.
