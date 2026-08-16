# RepairAtlas — Demo Script

## Target duration

**2:30–2:45**

The video should demonstrate the product, not explain every implementation detail.

## 0:00–0:12 — Hook

Show the operations dashboard and an asset in a fault state.

Narration:

> Field technicians repeatedly solve the same failures because repair knowledge disappears after every job. RepairAtlas turns every repair into institutional memory.

## 0:12–0:30 — New failure

Open `PRESS-204`.

Show:

- overheating
- extended operation
- current asset status

Technician asks:

> Diagnose this issue and tell me what I should check first.

## 0:30–0:55 — Memory retrieval

Show the agent activity panel:

- loaded asset state
- searched repair memory
- retrieved three relevant experiences

Open the strongest memory.

Show:

- previous symptoms
- diagnosis
- intervention
- outcome

## 0:55–1:15 — Outcome-aware reasoning

Show one historical failed intervention and one successful intervention.

Narration:

> The agent does not only find similar repairs. It compares what actually worked and what failed.

Display recommendation:

> Inspect intake airflow before replacing the motor.

## 1:15–1:35 — Controlled action

Technician selects **Approve diagnostic work order**.

Show:

- approval boundary
- work order created
- CockroachDB-backed state change

## 1:35–1:55 — Learning

Technician records:

> Intake obstruction confirmed. Filter replaced. Temperature returned to normal.

Agent creates a new repair experience.

Show:

- outcome saved
- embedding generated
- memory stored

## 1:55–2:15 — The payoff

Create a second incident with deliberately different wording:

> The unit is getting unusually hot during long operation and airflow feels weak.

Agent retrieves the earlier experience.

Highlight:

> Similar successful airflow repair found.

This is the most important moment of the video.

## 2:15–2:35 — Technology proof

Quick architecture view.

Highlight:

**CockroachDB**

- transactional state
- distributed vector memory
- Managed MCP Server

**AWS**

- Amazon Bedrock
- AgentCore Runtime
- Amazon S3

## 2:35–2:45 — Close

Narration:

> RepairAtlas doesn't just remember conversations. It remembers what happened, what worked, what failed—and uses that experience to make the next repair better.

End screen:

**RepairAtlas**

*Institutional memory for field operations.*

## Recording rules

- use a clean seeded demo environment
- no accidental personal information
- no API keys or credentials on screen
- no fake database results
- no fake agent activity
- show real memory retrieval
- show real memory write
- keep total duration below three minutes
- use only permitted assets/audio
- record at readable desktop resolution
- avoid long splash screens
