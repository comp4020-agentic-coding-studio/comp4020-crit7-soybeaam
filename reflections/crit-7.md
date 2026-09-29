# Crit 7 reflection

The breakthrough was deciding not to hand the room-panel build straight to
the agent and hope for the best. I had it explore and report on the existing
map, routing and DB code first, then briefed a build with the constraints
already written down — reuse the existing endpoint, keep the no-JS fallback,
don't touch the DB schema — and had it run a user-story check and a code
review on its own work before I even looked. The review caught a real
accessibility bug (focus jumping to the wrong element after repeated clicks)
that I would not have caught just eyeballing the diff. That's the pattern I
want to keep: orient, brief tightly, build, review, then I look — not
skip straight from prompt to "looks done."

It also changed how I think about "done." Type checks and the test suite
passing told me nothing about whether the map actually rendered — a stale
build cache silently broke it and the tests stayed green the whole time. I
only caught it by actually opening the app in a browser. Going forward I
want to be the kind of developer who treats "the checks pass" and "the thing
works" as two different claims, and always confirms the second one myself
instead of assuming the first implies it. Agentic tools make it very easy to
generate a lot of plausible-looking, passing work quickly; the discipline I
want to hold onto is spending that saved time on actually looking at the
result, not on generating more of it.
