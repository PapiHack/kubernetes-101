# Solutions — Bonus: three broken manifests

Instructor reference. Students should reach these from the error messages, not from here.

## Bug 1 — `broken-manifests/01-broken-pod-list.yaml`

`containers` is a mapping, not a list. Fix:

```yaml
spec:
  containers:
    - name: web                 # the dash is the fix
      image: hello-k8s:1.0
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 5000
```

Error seen: `ValidationError(Pod.spec.containers): invalid type for
io.k8s.api.core.v1.PodSpec.containers: got "map", expected "array"`.

Teaching point: client-side, before anything is sent. This is what
`kubectl apply --dry-run=client -f` is for.

## Bug 2 — `broken-manifests/02-broken-deploy-selector.yaml`

`spec.selector.matchLabels` says `app: hello`; `spec.template.metadata.labels` says
`app: helo`. Fix either one so both read `app: hello`.

Error seen: `selector does not match template labels`.

Teaching point: server-side validation. Note the asymmetry worth naming out loud — a
Deployment's selector/template mismatch **errors**, because both halves are in one object; a
*Service* selector that misses its Pods does not error at all, because they are two objects and
neither is wrong on its own. That is Session 4's debugging lab, and this is where to plant it.

`spec.selector` is also immutable on an existing Deployment — if a student already created one
and tries to edit the selector, they get a separate error and must delete and re-create.

## Bug 3 — `broken-manifests/03-broken-pod-image.yaml`

`image: hello-k8s:2.0` — only `1.0` was built and loaded. Fix the tag.

Status seen: `ErrImageNeverPull` (with `imagePullPolicy: IfNotPresent` and no such image
locally) or `ImagePullBackOff` if the cluster tries a registry.

Teaching points:
- `apply` succeeded and the object exists — "created" means stored.
- `kubectl logs` is **empty**, because no container ever started. Students reliably read empty
  logs as "the tool is broken". Name it: empty logs means the failure is earlier than the app.
- `kubectl describe` Events is the only place the reason appears.

If a student "fixes" it by removing `imagePullPolicy: IfNotPresent`, the Pod moves to
`ImagePullBackOff` instead as the kubelet tries Docker Hub — a good accident to discuss, not a
mistake to correct.

## If nobody gets to the bonus

Bug 3 is the one worth demoing from the instructor's screen for 60 seconds during the closing
discussion — the empty-`logs` lesson is the highest-value thing on the page and it is the
mistake most likely to block someone in Session 3.
