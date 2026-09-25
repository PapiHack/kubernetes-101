# Resources to Keep Learning

Everything here is official documentation. Blog posts age badly; these pages don't, and
learning to read them is itself one of the goals of this course.

## Start here after the course

1. [Kubernetes Basics tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/) — the official interactive walkthrough, consolidates all four sessions
2. [Killercoda](https://killercoda.com/) — free browser scenarios, nothing to install
3. Redo the Session 4 capstone **from scratch, from memory** — the highest-value hour you can spend
4. [CKAD certification](https://www.cncf.io/training/certification/ckad/) — realistic ~3 months out, and it's hands-on

## By session

**Session 1 — containers**

- [What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) · [What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) · [Dockerfile best practices](https://docs.docker.com/build/concepts/dockerfile/)
- [`docker run` reference](https://docs.docker.com/reference/cli/docker/container/run/) · [Docker Hub](https://docs.docker.com/docker-hub/)

**Session 2 — core concepts**

- [What is Kubernetes?](https://kubernetes.io/docs/concepts/overview/) · [Objects in Kubernetes](https://kubernetes.io/docs/concepts/overview/working-with-objects/)
- [Cluster architecture](https://kubernetes.io/docs/concepts/architecture/) · [Components](https://kubernetes.io/docs/concepts/overview/components/)
- [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) · [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)
- [Labels and selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)
- [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [kubectl overview](https://kubernetes.io/docs/reference/kubectl/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**Session 3 — exposing & configuring**

- [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) · [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Rolling updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- Storage: [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) · [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) · [Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/) · [Configure PV storage (task)](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/)

**Session 4 — debugging & what's next**

- [Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/) · [Troubleshoot applications](https://kubernetes.io/docs/tasks/debug/debug-application/)

## What we didn't cover (the map of the territory)

In roughly the order worth learning it:

- **Health** — [liveness/readiness/startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/): what makes a rolling update truly zero-downtime
- **Resources** — [requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/): requests decide placement, limits decide enforcement
- **Ingress in practice** — an ingress controller, host/path routing, TLS.
  Note when you go shopping: `ingress-nginx` was retired in March 2026 (no releases, no security
  fixes), so pick a maintained controller or start on Gateway API.
  📖 [Ingress NGINX retirement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)
- **NetworkPolicy** — default-deny a namespace, then allow one path; enforcement is the CNI's job
  📖 [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- **Security** — [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), ServiceAccounts, NetworkPolicies (by default every Pod can reach every Pod)
- **Packaging** — [Helm](https://helm.sh/docs/) charts, Kustomize
- **GitOps** — Argo CD, Flux: the reconciliation loop applied to your whole platform
- **Storage in depth** — StatefulSets, access modes, backup
- **Real-world clusters** — managed ([EKS](https://docs.aws.amazon.com/eks/), [AKS](https://learn.microsoft.com/azure/aks/), [GKE](https://cloud.google.com/kubernetes-engine/docs)) vs self-hosted

## Tools used in this course

- [kubectl install](https://kubernetes.io/docs/tasks/tools/) · [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) · [k3d](https://k3d.io/stable/)

## The habit that outlasts every link

```bash
kubectl explain deployment.spec.strategy   # the docs, in your terminal, offline
kubectl get --help                         # every flag, with examples
```
