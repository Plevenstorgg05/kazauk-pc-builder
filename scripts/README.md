# Verification scripts

## validate-collisions.py

Simulates the full disassembly and reassembly timeline and reports any pair of
parts whose bounding volumes intersect at any sampled point.

It reads part sizes and transforms directly from `lib/animation/choreography.ts`,
so it stays in sync with the animation rather than drifting from it.

    python3 scripts/validate-collisions.py

Exit code 0 means no collisions. It models:

- two-leg extraction (out along +X to the staging plane, then fan out)
- rotation applied only on the outer leg, in open air outside the chassis
- the chassis as its individual panels, never as a solid block
- rotated bounding volumes, not axis-aligned approximations

Re-run after ANY change to part sizes, positions or the extraction sequence.
This caught five static overlaps, three travel-path collisions, and a reassembly
overshoot that drove the GPU through the motherboard.
