import { mkdir, writeFile } from 'node:fs/promises';
import { content } from '../packages/content';
import { simulate } from '../packages/sim/src/combat';
import { canonical, hash } from '../packages/sim/src/determinism';
import { schemas, validateContent } from '../packages/sim/src/validation';
import { scenarios } from '../tests/scenarios';
await mkdir('tests/golden', { recursive: true });
await mkdir('schemas/v1', { recursive: true });
await mkdir('content', { recursive: true });
validateContent(content);
await writeFile('content/catalog.v1.json', `${JSON.stringify(content, null, 2)}\n`);
await writeFile('content/opponents.v1.json', `${JSON.stringify(content.opponents, null, 2)}\n`);
for (const [name, schema] of Object.entries(schemas))
  await writeFile(`schemas/v1/${name.toLowerCase()}.schema.json`, `${JSON.stringify(schema, null, 2)}\n`);
for (const s of scenarios()) {
  validateContent(s.content);
  const result = simulate(s.content, s.initial, s.seed).replay;
  if (result.final.outcome === 'error') throw new Error(result.final.error!);
  await writeFile(
    `tests/golden/${s.name}.json`,
    `${canonical({ version: 1, name: s.name, content: s.content, contentHash: hash(s.content), replay: result })}\n`,
  );
  console.log(`${s.name}: ${result.events.length} events · ${result.finalHash}`);
}
