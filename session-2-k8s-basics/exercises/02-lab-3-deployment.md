# Lab 3 — The Deployment, and the moment it heals itself

**35 minutes.** Goal: watch the reconciliation loop from slide 5 do its job, live, and see the
ownership chain Deployment → ReplicaSet → Pods with your own `kubectl get`.

This is the lab everything in the deck has been building towards. Do not rush step 2.

---

## 1. Read it before you apply it (5 min)

Open [`../manifests/02-deployment.yaml`](../manifests/02-deployment.yaml) beside
[`../manifests/01-pod.yaml`](../manifests/01-pod.yaml).

Find `spec.template`. Everything under it — `metadata`, `labels`, `spec`, `containers` — is the
**Pod manifest you applied in Lab 2**, embedded unchanged. That is slide 12's one line: a
Deployment is not a new dialect, it is a Pod with two wrappers.

Then find the two places `app: hello` appears: once under `spec.selector.matchLabels`, once
under `spec.template.metadata.labels`. They must be identical. That is slide 16, and it is the
bug we break on purpose in Session 4 — and in the bonus below.

```bash
kubectl apply -f manifests/02-deployment.yaml
kubectl get deploy,rs,pods
```

Look at the names in that output:

```
deployment.apps/hello-deploy
replicaset.apps/hello-deploy-7d9f8c        <- the Deployment made this
pod/hello-deploy-7d9f8c-x4k2p              <- the ReplicaSet made these
```

Each name extends its parent's. You never wrote the ReplicaSet — the Deployment did. Confirm
who owns a Pod:

```bash
kubectl describe pod <one-of-the-pod-names> | grep "Controlled By"
```

**Checkpoint:** `kubectl get deploy hello-deploy` shows `READY 3/3`.

**If stuck:** Pods stuck in `Pending` usually means the image never got loaded — see step 0 of
[`01-lab-2-first-pod.md`](01-lab-2-first-pod.md). `kubectl describe pod <name>` and read Events.

---

## 2. Kill one. Watch what happens. (10 min) — the moment

**Open a second terminal first.** The whole point is to be watching *before* you delete.

Terminal 1 — leave this running:

```bash
kubectl get pods -w
```

Terminal 2:

```bash
kubectl delete pod <one-of-the-pod-names>
```

Watch terminal 1. The Pod goes `Terminating`, and a **new one with a different name** appears
almost immediately, on its way to `Running`.

Now answer, in the chat, before reading on: **who did that?**

Nobody typed a command. The ReplicaSet's controller was in the middle of the loop from slide 5
— observe (2 Pods), compare (I want 3), act (create one) — and it has been running that loop
the entire time, several times a second, since you applied the file. Deleting a Pod did not
fight Kubernetes; it just made the loop have something to do.

Note the new Pod's **name and IP are different**. This is slide 10's mortality point made real:
a Pod is never repaired, only replaced. Never build anything on a Pod's identity — which is
exactly why Session 3 needs Services.

**Checkpoint:** you saw a replacement Pod appear without typing anything, and you can name the
thing that created it.

**If stuck:** if nothing reappeared, you probably deleted the *Deployment* rather than a Pod.
`kubectl get deploy` — if it is missing, re-apply and try again.

---

## 3. Scale, both ways (10 min)

```bash
kubectl scale deployment hello-deploy --replicas=5
kubectl get pods            # two more appeared

kubectl scale deployment hello-deploy --replicas=2
kubectl get pods            # three went away
```

One number. The same loop, reading a different desired state. Compare that with what you would
have typed last week to run five copies of this container across a fleet, and with what you
would have typed to take three of them away again.

Then try to win an argument with the loop:

```bash
kubectl delete pod --all
kubectl get pods
```

They all come back. You cannot delete your way out of a desired state — you have to *change*
the desired state. That is declarative infrastructure in one command.

**Checkpoint (required for Session 3):** `kubectl get deploy hello-deploy` shows its replicas
`READY`. Leave the Deployment running — Session 3 puts a Service in front of this exact object.

**If stuck:** `kubectl delete deploy hello-deploy` and re-apply `manifests/02-deployment.yaml`.
Session 3 re-applies it anyway, so ending here costs you nothing.

---

## 4. Where the desired state actually lives (5 min)

```bash
kubectl get deploy hello-deploy -o yaml | head -40
```

Scroll to `status:` further down:

```bash
kubectl get deploy hello-deploy -o yaml | grep -A8 "^status:"
```

Two halves, exactly as on slide 14: the `spec` you wrote, and the `status` the cluster wrote
back. You never write `status`; nothing but the cluster ever does. Every object in Kubernetes
has this shape.

**Checkpoint:** you can point at a field you wrote and a field the cluster wrote.
