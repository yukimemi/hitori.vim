import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import * as fn from "https://deno.land/x/denops_std@v4.0.0/function/mod.ts";
import * as helper from "https://deno.land/x/denops_std@v4.0.0/helper/mod.ts";
import * as vars from "https://deno.land/x/denops_std@v4.0.0/variable/mod.ts";
import { ensureString } from "https://deno.land/x/unknownutil@v2.1.0/mod.ts";
import type { Denops } from "https://deno.land/x/denops_std@v4.0.0/mod.ts";

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

export async function main(denops: Denops): Promise<void> {
  let isListen = false;

  // debug.
  const debug = await vars.g.get(denops, "hitori_debug", false);
  const quit = await vars.g.get(denops, "hitori_quit", true);
  const port = await vars.g.get(denops, "hitori_port", 7070);
  const blackListPatterns: string[] = await vars.g.get(
    denops,
    "hitori_blacklist_patterns",
    [],
  );
  enable = await vars.g.get(denops, "hitori_enable", true);

  // deno-lint-ignore no-explicit-any
  const clog = (...data: any[]): void => {
    if (debug) {
      console.log(...data);
    }
  };

  clog({ debug, port, enable, quit });

  denops.dispatcher = {
    async attach(..._args: unknown[]): Promise<void> {
      try {
        clog(`attach start`);
        if (!enable) {
          clog(`g:hitori_enable is false !`);
          return;
        }
        const bufPath = ensureString(await fn.expand(denops, "%:p"));
        clog({ bufPath });

        const ws = new WebSocket(`ws://localhost:${port}`);
        ws.onopen = () => {
          clog(`[client] open socket !`);
          clog(`[client] send buf path: ${bufPath}`);
          ws.send(bufPath);
        };
        ws.onmessage = async (e) => {
          const jsonData = JSON.parse(e.data);
          clog({ jsonData });
          if (!jsonData.open) {
            clog(`Open false, so skip !`);
          } else {
            helper.setSilent(denops, "silent!");
            await denops.cmd(`silent! bwipeout!`);
            if (quit) {
              await denops.cmd(`silent! qa!`);
            }
            helper.setSilent(denops, "");
          }
          clog(`[client] close socket !`);
          ws.close();
        };
      } catch (e) {
        console.log(e);
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
  if (isListen) {
    clog(`Server already running.`);
  }

  try {
    if (isListen) {
      await denops.dispatcher.attach();
    } else {
      serve((req) => {
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

            // black list check.
            if (blackListPatterns.some((p) => new RegExp(p).test(e.data))) {
              clog(`${e.data} is black list pattern ! so open skip !`);
              socket.send(
                JSON.stringify({
                  msg: "This data is black list patterns !",
                  open: false,
                }),
              );
              return;
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
            if (e.data) {
              console.log(`open ${e.data}`);
              await denops.cmd(`e ${e.data}`);
              socket.send(
                JSON.stringify({
                  msg: "Success open !",
                  open: true,
                }),
              );
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
      }, { port });
    }
  } catch (e) {
    console.log(e);
  }

  clog("dps-hitori has loaded");
}
