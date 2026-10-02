# Instructor Notes — Session 3

- Lab 1: the busybox one-liner demonstrates cluster DNS (`hello-svc` resolves). Emphasize: the Service IP is stable even as Pods churn.
- Lab 2: for kind, `kind load docker-image hello-k8s:1.0 --name k8s101` is required — local images aren't visible to the cluster otherwise. For k3d: `k3d image import hello-k8s:1.0 -c k8s101`.
- Env vars from ConfigMaps are read at container start — hence the `rollout restart`.
- Show `kubectl get secret hello-secret -o yaml`: base64 is encoding, NOT encryption. Good discussion point.
- Lab 3: the varying hostnames in the curl loop prove load balancing across replicas.
- Bonus PVC lab: 07 drops replicas to 1 — a ReadWriteOnce claim mounts on one node only; if students bump replicas on a multi-node kind cluster, extra Pods may stay Pending (good teachable failure). The delete-pod-then-check-file loop is the "aha" moment; without the PVC the file would be gone. `kubectl get pv` shows the auto-provisioned volume (default StorageClass: `standard` on kind, `local-path` on k3d). If short on time, run it as a demo instead of a lab (~10 min).
