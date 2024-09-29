// =============================================================================
// File        : base.ts
// Author      : yukimemi
// Last Change : 2024/08/12 01:56:41.
// =============================================================================

import { isAbsolute, join, normalize } from "jsr:@std/path@1.0.6";

import { Command, EnumType } from "jsr:@cliffy/command@1.0.0-rc.7";
import { z } from "npm:zod@3.23.8";

const logLevelType = new EnumType(["debug", "info", "warn", "error"]);

function isListening(port: number): boolean {
  // running check.
  try {
    const server = Deno.listen({ port });
    server.close();
    return false;
  } catch {
    return true;
  }
}

async function openVim(cmd: string, args: [(string | undefined)?]) {
  console.log({ cmd, args });
  const command = new Deno.Command(z.string().parse(cmd), {
    args: z.string().array().parse(args),
  });
  const child = command.spawn();
  const status = await child.status;
  console.log({ status });
}

export function createCmd(cmd: string, denoArgs: string[]) {
  return new Command()
    .name("hitori")
    .version("0.1.2")
    .description(
      "Execute vim / neovim with 1 instance like --remote or neovim-remote.",
    )
    .type("log-level", logLevelType)
    .env("DEBUG=<enable:boolean>", "Enable debug output.")
    .option("-d, --debug", "Enable debug output.")
    .option("-l, --log-level <level:log-level>", "Set log level.", {
      default: "info" as const,
    })
    .option("-p, --port <port:number>", "port number.", {
      default: 7070,
    })
    .arguments("[input]")
    .action(async (options, ...args) => {
      if (isListening(z.number().parse(options.port))) {
        const ws = new WebSocket(`ws://localhost:${options.port}`);
        // Resolve path.
        const a = args.map((x) => {
          if (x && !x.startsWith("-")) {
            if (!isAbsolute(x)) {
              return normalize(join(Deno.cwd(), x));
            }
          }
          return x;
        });
        ws.onopen = () => {
          console.log(`[client] open socket !`);
          console.log(`[client] send args: ${a.join(" ")}`);
          ws.send(a.join(" "));
        };
        ws.onmessage = async (e) => {
          const jsonData = JSON.parse(e.data);
          console.log(jsonData);
          if (!jsonData.open) {
            console.log(`Open false, so open editor !`);
            await openVim(cmd, args);
          }
          console.log(`[client] close socket !`);
          ws.close();
        };
      } else {
        await openVim(cmd, args);
      }
    })
    .parse(denoArgs);
}
