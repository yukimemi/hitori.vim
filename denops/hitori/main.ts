// =============================================================================
// File        : main.ts
// Author      : yukimemi
// Last Change : 2025/01/02 16:49:06.
// =============================================================================

import * as buffer from "jsr:@denops/std@7.5.0/buffer";
import * as fn from "jsr:@denops/std@7.5.0/function";
import * as helper from "jsr:@denops/std@7.5.0/helper";
import * as vars from "jsr:@denops/std@7.5.0/variable";
import type { Denops, Entrypoint } from "jsr:@denops/std@7.5.0";
import { z } from "npm:zod@3.24.2";

let enable = true;

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

async function win2wsl(denops: Denops, path: string): Promise<string> {
  if (await fn.has(denops, "wsl") && path[0] !== "/") {
    const cmd = new Deno.Command("wslpath", {
      args: [path],
    });
    const { stdout } = await cmd.output();
    return new TextDecoder().decode(stdout).trim();
  }
  return path;
}

async function wsl2win(denops: Denops, path: string): Promise<string> {
  if (!(await fn.has(denops, "wsl")) && Deno.build.os === "windows" && path[0] === "/") {
    const cmd = new Deno.Command("wsl", {
      args: ["wslpath", "-w", path],
    });
    const { stdout } = await cmd.output();
    return new TextDecoder().decode(stdout).trim();
  }
  return path;
}

export const main: Entrypoint = async (denops: Denops) => {
  let isListen = false;
  const hasWin = await fn.has(denops, "win32");
  const hasWsl = await fn.has(denops, "wsl");

  // debug.
  const debug = await vars.g.get(denops, "hitori_debug", false);
  const quit = await vars.g.get(denops, "hitori_quit", true);
  const port = await vars.g.get(denops, "hitori_port", 7070);
  const wsl = await vars.g.get(denops, "hitori_wsl", false);
  const opener = await vars.g.get(denops, "hitori_opener", "tab drop");
  const ignorePatterns: string[] = await vars.g.get(
    denops,
    "hitori_ignore_patterns",
    ["\\.tmp$", "\\.diff$", "(COMMIT_EDIT|TAG_EDIT|MERGE_|SQUASH_)MSG$"],
  );
  enable = await vars.g.get(denops, "hitori_enable", true);

  // deno-lint-ignore no-explicit-any
  const clog = (...data: any[]): void => {
    if (debug) {
      console.log(...data);
    }
  };

  clog({ debug, port, enable, quit, wsl });

  denops.dispatcher = {
    async attach(..._args: unknown[]): Promise<void> {
      try {
        clog(`attach start`);
        if (!enable) {
          clog(`g:hitori_enable is false !`);
          return;
        }
        const bufPath = z.string().parse(await fn.expand(denops, "%:p"));
        clog({ bufPath });

        if (ignorePatterns.some((p) => new RegExp(p).test(bufPath))) {
          clog(`${bufPath} is ignore list pattern ! so open skip !`);
          return;
        }

        const ws = new WebSocket(`ws://localhost:${port}`);
        ws.onopen = async () => {
          clog(`[client] open socket !`);
          clog(`[client] send buf path: ${bufPath}`);
          await denops.cmd(`silent! bwipeout!`);
          ws.send(bufPath);
        };
        ws.onmessage = async (e) => {
          const jsonData = JSON.parse(e.data);
          clog({ jsonData });
          if (!jsonData.open) {
            clog(`Open false, so reopen !`);
            try {
              await buffer.open(denops, bufPath);
            } catch (e) {
              clog(e);
            }
          } else {
            if (quit) {
              await denops.cmd(`silent! qa!`);
            }
            try {
              await buffer.open(denops, bufPath);
            } catch (e) {
              clog(e);
            }
          }
          clog(`[client] close socket !`);
          ws.close();
        };
      } catch (e) {
        clog(e);
      } finally {
        clog(`attach end`);
      }
    },
    // deno-lint-ignore require-await
    async enable(): Promise<void> {
      enable = true;
    },
    // deno-lint-ignore require-await
    async disable(): Promise<void> {
      enable = false;
    },
  };

  await helper.execute(
    denops,
    `
    function! s:${denops.name}_notify(method, params) abort
      call denops#plugin#wait_async('${denops.name}', function('denops#notify', ['${denops.name}', a:method, a:params]))
    endfunction

    command! EnableHitori call s:${denops.name}_notify('enable', [])
    command! DisableHitori call s:${denops.name}_notify('disable', [])
  `,
  );

  isListen = isListening(port);

  try {
    if (isListen) {
      clog(`Server already running.`);
      await denops.dispatcher.attach();
    } else {
      Deno.serve({ port }, (req) => {
        clog(req);
        const { response, socket } = Deno.upgradeWebSocket(req);
        socket.addEventListener("open", () => clog("[server] open !"));
        socket.addEventListener(
          "error",
          (e) => clog(`[server] error !`, e),
        );
        socket.addEventListener("close", () => clog("[server] close !"));
        socket.addEventListener(
          "message",
          async (e) => {
            clog(`[server] message ! ${e.data}`);

            let bufPath = e.data;

            // ignore list check.
            if (ignorePatterns.some((p) => new RegExp(p).test(bufPath))) {
              clog(`${bufPath} is ignore list pattern ! so open skip !`);
              socket.send(
                JSON.stringify({
                  msg: "This data is ignore list patterns !",
                  open: false,
                }),
              );
              return;
            }

            if (!wsl) {
              if (hasWin && bufPath[0] === "/") {
                clog(`${bufPath} is wsl path pattern ! so open skip !`);
                socket.send(
                  JSON.stringify({
                    msg: "This data is wsl path patterns !",
                    open: false,
                  }),
                );
                return;
              }
              if (hasWsl && bufPath[0] !== "/") {
                clog(`${bufPath} is windows path pattern ! so open skip !`);
                socket.send(
                  JSON.stringify({
                    msg: "This data is windows path patterns !",
                    open: false,
                  }),
                );
                return;
              }
            }
            if (!enable) {
              clog(`Disable hitori ...`);
              socket.send(
                JSON.stringify({
                  msg: "hitori is disabled !",
                  open: false,
                }),
              );
              return;
            }
            if (bufPath) {
              clog(`open ${bufPath}`);
              socket.send(
                JSON.stringify({
                  msg: "Success open !",
                  open: true,
                }),
              );
              if (wsl) {
                bufPath = await wsl2win(denops, await win2wsl(denops, bufPath));
              }
              console.log(`open ${bufPath}`);
              await buffer.open(denops, bufPath, { opener });
            } else {
              clog(`data is null !`);
              socket.send(
                JSON.stringify({
                  msg: "Not open !",
                  open: true,
                }),
              );
            }
          },
        );
        return response;
      });
    }
  } catch (e) {
    console.error(e);
  }

  clog("hitori.vim has loaded");
};
