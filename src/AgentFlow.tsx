import { useState } from 'react';

const stages = [
  { name: 'Map', icon: '01', title: 'Make sense of the input.', detail: 'Turn requirements into structured context. Retrieve the right knowledge before taking the next step.', code: 'context = retrieve(requirements)', tags: ['Requirements', 'Retrieval', 'pgvector'] },
  { name: 'Plan', icon: '02', title: 'Give reasoning a direction.', detail: 'Break a complex objective into small, explicit steps with dependencies and a clear execution path.', code: 'plan = graph.build(context)', tags: ['LangGraph', 'Reasoning', 'Orchestration'] },
  { name: 'Review', icon: '03', title: 'Keep people in the loop.', detail: 'Make the proposed actions visible. Give a human reviewer the context to approve or refine the plan.', code: 'approved = await human.review(plan)', tags: ['Human review', 'Transparency', 'Control'] },
  { name: 'Execute', icon: '04', title: 'Turn a plan into an outcome.', detail: 'Run approved actions through focused executors, with validation and traceability along the way.', code: 'result = executor.run(approved)', tags: ['FastAPI', 'Validation', 'Observability'] },
];

export default function AgentFlow() {
  const [active, setActive] = useState(0);
  const stage = stages[active];
  return <div className="agent-console">
    <div className="console-top"><span><i /> SYSTEM / WORKFLOW</span><span>INTERACTIVE DEMO</span></div>
    <div className="flow-orbit" aria-hidden="true"><div className="orbit-ring ring-two" /><div className="orbit-ring" /><span className="orbit-node node-a">context</span><span className="orbit-node node-b">tools</span><span className="orbit-node node-c">human</span><div className="agent-core">VK<span>agentic systems</span></div><span className="orbit-spark" /></div>
    <div className="flow-tabs" role="tablist" aria-label="Explore an agent workflow">{stages.map((s, i) => <button key={s.name} id={`stage-${i}`} role="tab" aria-selected={active === i} aria-controls="flow-detail" tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(e) => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (i + (e.key === 'ArrowRight' ? 1 : 3)) % 4; setActive(next); document.getElementById(`stage-${next}`)?.focus(); } }}><small>{s.icon}</small>{s.name}</button>)}</div>
    <div className="flow-detail" id="flow-detail" role="tabpanel" aria-labelledby={`stage-${active}`}><h3>{stage.title}</h3><p>{stage.detail}</p><code><span>›</span> {stage.code}</code><div className="flow-tags">{stage.tags.map(t => <span key={t}>{t}</span>)}</div></div>
    <div className="console-bottom"><span><i /> HUMAN-GUIDED BY DESIGN</span><button onClick={() => setActive((active + 1) % 4)}>Next step ↗</button></div>
  </div>;
}
