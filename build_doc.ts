import { pod2markdown, pod2vimdoc } from "https://pax.deno.dev/yukimemi/deno-pod@0.0.2/mod.ts";
import { basename } from "https://deno.land/std@0.194.0/path/mod.ts";

let name = "";
for await (const p of Deno.readDir("./pod")) {
  name = basename(p.name, ".pod");
  break;
}

const pod = `./pod/${name}.pod`;
const vimdoc = `./doc/${name}.txt`;
const markdown = "./README.md";

await pod2vimdoc(pod, vimdoc);
await pod2markdown(pod, markdown);
