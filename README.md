# Kubernetes 101 — 8-Hour Initiation Course

An introductory Kubernetes training for students: 4 **online** sessions × 2 hours, from containers to a full 2-tier application on a local cluster.

## Course Structure

| Session | Topic | Theory / Hands-on |
|---|---|---|
| [Session 1](session-1-containers/) | Containers: The Foundations | 45 min / 1h15 |
| [Session 2](session-2-k8s-basics/) | Kubernetes: Core Concepts | 45 min / 1h15 |
| [Session 3](session-3-services-config/) | Exposing & Configuring Applications | 40 min / 1h20 |
| [Session 4](session-4-capstone/) | Full Application & Next Steps | 30 min / 1h30 |

The narrative thread: **each session answers a limitation of the previous one** — single container → orchestration → exposure → real app.

Each session ships an HTML slide deck for the theory block: `session-*/slides/theory.html` — open it in a browser, arrow keys to navigate, `N` toggles speaker notes, Ctrl/Cmd+P exports to PDF.

## Learning Outcomes

By the end of the 8 hours, a trainee can:

- **Containerize an app** — write a Dockerfile, build/tag an image, run it with port mapping, read logs, shell in, and explain image vs container
- **Explain the core idea** — desired state vs actual state, and the reconciliation loop that closes the gap
- **Operate a cluster with kubectl** — `get` with formatting and label selectors, `describe` to read events, `logs`, `exec`, `explain`, and the triage order when something breaks
- **Deploy and run an app** — Deployments, replicas, scaling, rolling updates and rollback
- **Expose and configure it** — ClusterIP + cluster DNS, NodePort, ConfigMaps and Secrets (and why base64 is not encryption); a first look at PVCs
- **Debug the classic failures** — `ImagePullBackOff`, a selector matching nothing, `Pending` for lack of resources
- **Assemble a 2-tier app** — two Deployments, two Services, a ConfigMap, frontend calling backend by service name

Explicitly **not** covered (and stated as such in Session 4): probes, resource tuning, RBAC and NetworkPolicies, Ingress/TLS in practice, Helm, CI/CD and GitOps, managed clusters, storage and networking in depth. The goal is a correct mental model plus enough kubectl fluency to read the official documentation unaided.

## Prerequisites

- A laptop with Docker installed ([Docker Desktop](https://docs.docker.com/get-docker/) or Docker Engine)
- `kubectl` — [install guide](https://kubernetes.io/docs/tasks/tools/)
- `kind` or `k3d` for the local cluster (Sessions 2–4) — see [docs/setup.md](docs/setup.md)
- **Pre-work (required before Session 2):** complete [docs/setup.md](docs/setup.md) and arrive with `kubectl get nodes` working — setup is NOT done live in session
- **Plan B:** [Killercoda](https://killercoda.com/) free browser-based labs for anyone whose local install fails

## Repo Layout

```
kubernetes_101/
├── docs/                     # Setup guide, cheatsheet, quiz
├── session-1-containers/     # Dockerfile lab + sample app
├── session-2-k8s-basics/     # Pod & Deployment manifests
├── session-3-services-config/# Services, ConfigMaps, Secrets
└── session-4-capstone/       # 2-tier app + guided debugging
```

Each session folder contains a `README.md` with the session plan, `manifests/` (or lab files) for students, and `solutions/` for instructors.

## Teaching Tips

- Keep at least a **40/60 theory/hands-on ratio** — students disengage fast on YAML-at-the-projector.
- Session 2's "delete a Pod and watch it come back" is the **wow moment** — don't rush it.
- Session 4's broken manifests are intentional: debugging with `describe`/`logs`/`events` is the real skill.

### Nobody stays blocked

Every lab is designed so a stuck student can rejoin at the next one. The rules:

- **Checkpoints.** Each lab ends with a one-command check ("you should see X"). That check is the only thing the next lab depends on.
- **The 5-minute rule.** A student stuck for 5 minutes stops debugging and takes the escape hatch — the instructor comes back to them during the next theory block, not live.
- **Escape hatch per lab.** Every lab has a documented "if it doesn't work, run this instead" path (a reference file, a public image, or a catch-up command) that produces the checkpoint state. Taking it is normal, not failure — say this out loud in Session 1.
- **Killercoda for cluster-level breakage.** If the local cluster is the problem, switch that student to Killercoda for the rest of the session rather than reinstalling live.
- **Nothing carries over unsolved.** Sessions 2–4 start from manifests in the repo, never from what a student built last time, so one bad session never cascades.

### Online delivery

- Collect proof of pre-work before each session (a screenshot of `kubectl get nodes` in the chat) — you can't walk around the room to fix laptops.
- Debug via screen-share, one student at a time, while the others continue the lab; switch a blocked student to Killercoda after ~5 minutes rather than stalling the group.
- Keep every command copy-pasteable from the READMEs — dictating commands on a call doesn't work.
- Use quick chat check-ins ("type `done` when your pod is Running") to pace the labs — this is also how you spot a silently blocked student, who online will not raise a hand.
- Post each lab's checkpoint command in the chat so late joiners can self-verify without interrupting.

## Going Further

Persistent storage in depth (PV/PVC get a first look in the Session 3 bonus lab), probes, RBAC, Helm, GitOps (ArgoCD), managed clusters (EKS/AKS/GKE), and the [CKAD certification](https://www.cncf.io/training/certification/ckad/) as a goal. See [docs/resources.md](docs/resources.md).
