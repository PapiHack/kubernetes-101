# kubectl Cheatsheet

## The basics
Almost everything follows the same pattern: `kubectl <verb> <resource> [name] [flags]`.
```bash
kubectl get pods                     # list a resource type
kubectl get pods -o wide             # more columns (node, IP)
kubectl get pod <name> -o yaml       # full object as YAML — what the cluster really stores
kubectl get pods --show-labels       # display labels
kubectl get pods -l app=hello        # filter by label (how Services select Pods!)
kubectl apply -f manifest.yaml       # create OR update from a file (declarative)
kubectl describe pod <name>          # human-readable details + Events at the bottom
kubectl get events --sort-by=.lastTimestamp   # what happened recently, cluster-side
kubectl explain deployment.spec      # built-in doc for any field
```

## Logs & exec
```bash
kubectl get all                      # everything in the namespace
kubectl logs <pod>                   # container logs
kubectl logs -f <pod>                # follow logs
kubectl exec -it <pod> -- sh         # shell into a container
```

## Delete
```bash
kubectl delete -f manifest.yaml
kubectl delete pod <name>
```

## Scale & rollouts
```bash
kubectl scale deployment <name> --replicas=5
kubectl set image deployment/<name> <container>=<image>:<tag>
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout undo deployment/<name>
```

## Storage (Session 3 bonus)
```bash
kubectl get pvc                      # claims + their status (Bound / Pending)
kubectl get pv                       # the actual provisioned volumes
kubectl get storageclass             # how volumes get provisioned (kind: "standard")
kubectl describe pvc <name>          # events explain why a claim is Pending
```

## Namespaces
```bash
kubectl get ns
kubectl -n <namespace> get pods
kubectl create namespace demo
```

## Debug triage order
1. `kubectl get pods` — what state? (Pending, ImagePullBackOff, CrashLoopBackOff...)
2. `kubectl describe pod <name>` — read the Events section
3. `kubectl logs <pod>` — application errors
