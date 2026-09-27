# Instructor Notes — Session 2

## Before the session
- **The labs now run the students' own `hello-k8s:1.0` from Session 1**, not `nginx`. Slide 8
  promises that continuity; the manifests finally keep it.
- Cluster nodes can't see laptop images, so Lab 2 opens with a build + `kind load`. Expect this
  to be the single biggest source of lost minutes. Have the fallback ready to paste in the chat:
  edit `manifests/01-pod.yaml` to `nginx:1.27` on port `80` and everything else works unchanged.
- Run the build + load yourself on the shared screen first, so the room sees it once before
  doing it.
- Killercoda users have no local image — they take the `nginx` fallback, or clone and build
  in the playground.

## Lab 2
- The standalone Pod is not recreated after deletion — nothing declares a desired replica count,
  so no controller has an opinion about it. This sets up the Deployment.
- In `kubectl describe`, make them find **Node:**, **IP:** and the **Events** block. The events
  (`Scheduled` → `Pulled` → `Created` → `Started`) are slide 7's five-step journey in their own
  terminal; point at the slide while they read their screen.
- `kubectl exec ... -- wget -qO- http://localhost:5000` returns their own Flask greeting with the
  Pod's hostname. Land that they had to be *inside* to reach it — that hole is Session 3's Service.

## Lab 3
- Have students run `kubectl get pods -w` in a second terminal **before** deleting. The instant
  recreation is the moment that lands; if they delete first they miss it and it falls flat.
- Show the ownership chain: `kubectl get deploy,rs,pods` — each name extends its parent's
  (`hello-deploy` → `hello-deploy-7d9f8c` → `hello-deploy-7d9f8c-x4k2p`). Then
  `kubectl describe pod <name> | grep "Controlled By"`.
- `kubectl delete pod --all` is the best version of the point: you cannot delete your way out of
  a desired state, you have to change it.
- Step 4 (`-o yaml`, spec vs status) is the flex slot — cut it if Lab 3 ran long. Slide 14 covers
  the idea and Session 3 re-opens it.
- If time allows: `kubectl explain deployment.spec` to show self-documenting APIs.

## Bonus
- Full solutions in [`bonus-break-it.md`](bonus-break-it.md).
- If nobody reaches it, demo bug 3 for 60 seconds in the closing discussion: `apply` succeeds,
  the Pod never runs, and `kubectl logs` is **empty** because no container ever started. Students
  reliably read empty logs as a broken tool. It is also the failure most likely to block someone
  in Session 3.

## Hand-off to Session 3
- Leave `hello-deploy` running and the image loaded. Session 3 Lab 1 puts a Service in front of
  this exact Deployment, and `01-service-clusterip.yaml` now targets port **5000** to match.
