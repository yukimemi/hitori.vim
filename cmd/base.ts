// =============================================================================
// File        : base.ts
// Author      : yukimemi
// Last Change : 2025/01/02 18:01:13.
// =============================================================================

import { isAbsolute, join, normalize } from "jsr:@std/path@1.0.8";

import { Command, EnumType } from "jsr:@cliffy/command@1.0.0-rc.7";
import { z } from "npm:zod@3.24.2";

const logLevelType = new EnumType(["debug", "info", "warn", "error"]);

function isListening(port: number): boolean {
  // running check.
  try {
    const server = Deno.listen({ port });
    server.close();
    return false;
  } catch (e) {
    // console.warn(e);
    return true;
  }
}

async function win2wsl(path: string): Promise<string> {
  if (path[0] !== "/") {
    const cmd = new Deno.Command("wsl", {
      args: ["-e", "wslpath", path],
    });
    const { stdout } = await cmd.output();
    return new TextDecoder().decode(stdout).trim();
  }
  return path;
}

async function openVim(cmd: string[], args: [(string | undefined)?]) {
  console.log({ cmd, args });
  const cmds = z.string().array().parse(cmd);
  const cmdHead = cmds[0];
  const cmdTail = cmds.slice(1);
  const escapeArgs = await Promise.all(z.string().array().parse(args).map(async (a) => {
    if (a.startsWith("-") || cmdHead !== "wsl") {
      return a;
    }
    return await win2wsl(a);
  }));
  console.log({ cmdHead, cmdTail, escapeArgs });
  const command = new Deno.Command(cmdHead, {
    args: cmdTail.concat(escapeArgs),
  });
  const child = command.spawn();
  const status = await child.status;
  console.log({ status });
}

export function createCmd(cmd: string[], denoArgs: string[]) {
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
      console.log({ cmd, denoArgs, options, args });
      if (isListening(z.number().parse(options.port))) {
        console.log(`server is running !`);
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
        console.log(`server is not running !`);
        await openVim(cmd, args);
      }
    })
    .parse(denoArgs);
}
