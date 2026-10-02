# Session 3 — Exposing & Configuring Applications (2h)

**Slides:** [`slides/theory.html`](slides/theory.html)

**By the end of this session you can:** explain why Pod IPs are useless and what a Service does about it; choose between ClusterIP, NodePort and LoadBalancer; reach one app from another by DNS name; move config out of the image with ConfigMaps and Secrets; scale, roll out and roll back.

## Theory (40 min)
- Services: ClusterIP, NodePort, LoadBalancer — Pods are ephemeral, you need a stable access point. The three types are taught as **three layers, not three alternatives**: one column each, traffic flowing top to bottom, the picture growing left to right. ClusterIP is reachable only from inside (the arrow from outside stops at the wall); NodePort adds the same port on every node; LoadBalancer adds a real load balancer your cloud creates *outside* the cluster. Ask for a LoadBalancer and you get all three. On kind there is no cloud, so a LoadBalancer Service sits at `EXTERNAL-IP: <pending>` forever — worth a ten-second demo. Cluster DNS (`backend.default.svc.cluster.local`) is how services find each other
  📖 [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- Ingress at a high level (HTTP routing, TLS, one entry point instead of a port per app — and: no ingress controller means nothing happens)
  📖 [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- ConfigMaps and Secrets: separating config from code; env vars are read once at container start (hence `rollout restart`); base64 is encoding, **not** encryption
  📖 [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) · [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- (Bonus) Storage: Pods are ephemeral — PersistentVolumeClaims let data outlive them; you write a claim, the StorageClass provisions the volume
  📖 [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) · [Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)

## Hands-on (1h20)

### Lab 1 — Expose the Deployment (25 min)
Reuses the `hello-deploy` from Session 2 (re-apply if needed).
```bash
kubectl apply -f manifests/01-service-clusterip.yaml
kubectl get svc
kubectl run tmp --rm -it --image=busybox -- wget -qO- http://hello-svc   # internal DNS!
kubectl apply -f manifests/02-service-nodeport.yaml
curl http://localhost:30080        # works thanks to the kind/k3d port mapping
```

**Checkpoint:** `kubectl get svc` lists `hello-svc`, and the NodePort answers on 30080.
**If stuck:** no Deployment from Session 2 → `kubectl apply -f ../session-2-k8s-basics/manifests/02-deployment.yaml`. NodePort refuses to connect → your cluster was created without the port mapping; use `kubectl port-forward svc/hello-svc 8080:80` for the rest of the session and recreate the cluster later with [`../docs/kind-config.yaml`](../docs/kind-config.yaml).

### Lab 2 — ConfigMap + Secret (25 min)
Switch the Deployment to the Flask app from Session 1 and inject config:
```bash
kubectl apply -f manifests/03-configmap.yaml
kubectl apply -f manifests/04-secret.yaml
kubectl apply -f manifests/05-deployment-with-config.yaml
curl http://localhost:30080        # greeting now comes from the ConfigMap
```
Change the ConfigMap value, re-apply, and `kubectl rollout restart deployment hello-deploy`. Config changed, image untouched.

**Checkpoint:** the response on 30080 reflects the ConfigMap value.
**If stuck:** `ImagePullBackOff` / `ErrImageNeverPull` means `hello-k8s:1.0` isn't in the cluster — rebuild and load it:
```bash
docker build -t hello-k8s:1.0 ../session-1-containers/app
kind load docker-image hello-k8s:1.0 --name k8s101    # k3d: k3d image import hello-k8s:1.0 -c k8s101
kubectl rollout restart deployment hello-deploy
```
Still failing after 5 minutes → follow the ConfigMap part on the instructor's screen-share and continue with Lab 3, which only scales and rolls out whatever `hello-deploy` is already running.

### Lab 3 — Scaling & rolling update (30 min) — flex slot
If the group is behind schedule, cut from here (rollout history/undo first) — never from Lab 2.
```bash
kubectl scale deployment hello-deploy --replicas=4
for i in $(seq 1 10); do curl -s http://localhost:30080; done   # hostnames vary: load balancing!

# tag the Session 1 image again as 2.0 and load it, so there is a second version to roll to
docker tag hello-k8s:1.0 hello-k8s:2.0
kind load docker-image hello-k8s:2.0 --name k8s101        # k3d: k3d image import hello-k8s:2.0 -c k8s101

kubectl set image deployment/hello-deploy web=hello-k8s:2.0
kubectl rollout status deployment/hello-deploy
kubectl rollout history deployment/hello-deploy
kubectl rollout undo deployment/hello-deploy               # rollback
```

### Bonus Lab — Persistent storage with a PVC (if time allows)
Everything in a container's filesystem dies with the Pod. Let's prove it, then fix it.

```bash
# 1. Claim storage — kind/k3d provision a PersistentVolume automatically
kubectl apply -f manifests/06-pvc.yaml
kubectl get pvc                      # STATUS: Bound (or Pending until first use)

# 2. Mount it into the app at /data (replicas=1: RWO volume)
kubectl apply -f manifests/07-deployment-with-pvc.yaml
kubectl rollout status deployment/hello-deploy

# 3. Write a file into the volume
POD=$(kubectl get pods -l app=hello -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POD -- sh -c 'echo "I survive pod restarts!" > /data/proof.txt'

# 4. Kill the Pod — the Deployment recreates it
kubectl delete pod $POD
kubectl get pods -w                  # Ctrl+C once the new pod is Running

# 5. The file is still there
POD=$(kubectl get pods -l app=hello -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POD -- cat /data/proof.txt
```

**If stuck:** PVC stuck `Pending` → `kubectl describe pvc hello-data` and check `kubectl get storageclass` has a default. This lab is a bonus: skip it without consequence, nothing later depends on it.

Discussion: what would have happened without the PVC? Where does the data actually live? (`kubectl get pv` — the PV was provisioned by the cluster's default StorageClass, `kubectl get storageclass`.)

## Go deeper on your own

1. [Service](https://kubernetes.io/docs/concepts/services-networking/service/) — read the type comparison carefully
2. [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) — short, and it demystifies service discovery
3. [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) + [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) — note the "risks" section of the Secret page
4. [Rolling updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/) — what actually happens during `set image`
5. [Configure persistent volume storage](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/) — the hands-on version of the bonus lab
