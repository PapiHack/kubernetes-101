# Bonus — Three broken manifests, and the order you debug them in

**Optional, ~10 minutes.** Do this if you finished Lab 3 early, or at home. There is no fixed
slot for it — it must not eat into Lab 3 or the closing discussion.

Goal: meet the three places a manifest can fail, and learn that they fail at *different
moments* — which is the whole reason slide 18's order is `get` → `describe` → `logs`.

Three files in [`../broken-manifests/`](../broken-manifests/). Each has exactly one bug. Work
them in order: they get quieter as you go.

> **Rule: do not diff them against the working manifests.** The skill is reading the error, not
> spotting the difference. Fix each file in place, re-apply, confirm, move on.

---

## Bug 1 — rejected before the cluster sees it

```bash
kubectl apply -f broken-manifests/01-broken-pod-list.yaml
```

It fails immediately, and the message names the field and the type it wanted:

```
invalid type for ...PodSpec.containers: got "map", expected "array"
```

**"Expected array"** is YAML's way of saying *this should have been a list and it isn't*.
Slide 9 warned about exactly this: `containers` is a list, and the `-` is what makes it one.

**Fix:** add the missing `-`, and indent the keys underneath to match.
**Confirm:** `kubectl apply -f broken-manifests/01-broken-pod-list.yaml` creates `broken-pod`.

Nothing reached the cluster while this was broken. `kubectl get pods` never had anything to
show you — which is why `get` is the *first* command, not the one that explains things.

---

## Bug 2 — accepted as YAML, rejected as Kubernetes

```bash
kubectl apply -f broken-manifests/02-broken-deploy-selector.yaml
```

Valid YAML. Valid field types. Still refused:

```
Deployment.apps "broken-deploy" is invalid:
  spec.template.metadata.labels: Invalid value: map[string]string{"app":"helo"}:
  `selector` does not match template labels
```

This is slide 16's #1 beginner bug, and the API server catches it here because a Deployment
whose selector does not match its own template would create Pods it then does not recognise as
its own — and loop forever creating more.

**Fix:** make the two labels identical.
**Confirm:** `kubectl get deploy broken-deploy` shows its replicas `READY`.

Worth knowing: you got a clear error because both halves live in *one* object. In Session 4 you
will meet the same mismatch split across **two** objects — a Service whose selector misses its
Pods — and there nothing errors at all. The Service simply returns nothing, forever.

📖 [Labels and selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)

---

## Bug 3 — accepted, created, and still broken

```bash
kubectl apply -f broken-manifests/03-broken-pod-image.yaml
```

`pod/broken-image-pod created`. No error anywhere. This is slide 7's point with teeth:
**"created" means stored, not running.**

```bash
kubectl get pods
```

`ErrImageNeverPull` or `ImagePullBackOff`, and it never becomes `Running`. Now the order earns
its keep:

```bash
kubectl describe pod broken-image-pod    # scroll to Events
kubectl logs broken-image-pod            # ...nothing. Why?
```

`describe` tells you plainly that the image is not present and the pull policy forbids fetching
it. `logs` gives you nothing at all — **there is no container running to have written any**.
That is the single most useful thing on this page: when `logs` is empty, the problem is *before*
your application started, and `describe` is where the answer is.

**Fix:** the tag. You built `hello-k8s:1.0`; this asks for `2.0`, which does not exist.
**Confirm:** `kubectl get pod broken-image-pod` reaches `Running`.

📖 [Debugging Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/)

---

## Clean up

```bash
kubectl delete -f broken-manifests/
```

## The takeaway, in one table

| Bug | Caught by | The tool that told you |
|---|---|---|
| Missing `-` | `kubectl` itself, before sending | the error on `apply` |
| Selector ≠ template | the API server, on validation | the error on `apply` |
| Wrong image tag | nothing — it was stored happily | `kubectl describe`, in Events |

The further down that table a bug sits, the more you need `describe`. An empty `kubectl logs`
is not a dead end — it is evidence.

**Checkpoint:** you can say why `kubectl logs` was empty for bug 3 but the Pod still existed.

Solutions: [`../solutions/bonus-break-it.md`](../solutions/bonus-break-it.md).
