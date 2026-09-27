# Environment Setup

## 1. Docker
Verify with:
```bash
docker run --rm hello-world
```

## 2. kubectl
```bash
kubectl version --client
```
Install: https://kubernetes.io/docs/tasks/tools/

## 3. Local cluster (kind or k3d)

### Option A — kind (recommended)
```bash
kind create cluster --name k8s101 --config docs/kind-config.yaml
kubectl cluster-info --context kind-k8s101
```

### Option B — k3d (lighter, good for modest hardware)
```bash
k3d cluster create k8s101 -p "30080:30080@server:0" -p "8080:80@loadbalancer"
```
The first mapping exposes NodePort 30080 for Sessions 3 and 4. The second is for the
Session 4 Ingress bonus — k3d ships an ingress controller (Traefik) already running, so
that bonus needs nothing else installed.
📖 [k3s networking services](https://docs.k3s.io/networking/networking-services)

> **Which one for the Ingress bonus?** Both configs above are ready for it, but k3d is the
> easy path: its controller is already there. On kind you would have to install one
> yourself, and the controller most tutorials still name — `ingress-nginx` — was
> **retired in March 2026** (no releases, no security fixes).
> 📖 [Ingress NGINX retirement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)

## Plan B — Killercoda
If local installs fail on the day: https://killercoda.com/playgrounds/scenario/kubernetes
A ready-to-use cluster in the browser, nothing to install.
