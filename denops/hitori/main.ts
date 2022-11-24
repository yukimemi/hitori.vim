import { serve } from "https://deno.land/std@0.165.0/http/server.ts";
import * as fn from "https://deno.land/x/denops_std@v3.9.3/function/mod.ts";
import * as helper from "https://deno.land/x/denops_std@v3.9.3/helper/mod.ts";
import * as vars from "https://deno.land/x/denops_std@v3.9.3/variable/mod.ts";
import { ensureString } from "https://deno.land/x/unknownutil@v2.1.0/mod.ts";
import type { Denops } from "https://deno.land/x/denops_std@v3.9.3/mod.ts";

function listenCheck(port: number): boolean {
  // running check.
  try {
    const server = Deno.listen({ port });
    server.close();
    return true;
  } catch {
    return false;
  }
}

export async function main(denops: Denops): Promise<void> {
  let hitori = false;

  // debug.
  const debug = await vars.g.get(denops, "hitori_debug", false);
  const enable = await vars.g.get(denops, "hitori_enable", true);
  const quit = await vars.g.get(denops, "hitori_quit", true);
  const port = await vars.g.get(denops, "hitori_port", 7070);

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
        ws.onopen = async () => {
          clog(`[client] open socket !`);
          clog(`[client] send buf path: ${bufPath}`);
          ws.send(bufPath);
          clog(`[client] close socket !`);
          ws.close();
          if (quit) {
            await denops.cmd(`qa`);
          }
        };
      } catch (e) {
        console.log(e);
      } finally {
        clog(`attach end`);
      }
    },
  };

  await helper.execute(
    denops,
    `
    function! s:${denops.name}_notify(method, params) abort
      call denops#plugin#wait_async('${denops.name}', function('denops#notify', ['${denops.name}', a:method, a:params]))
    endfunction
  `,
  );

  hitori = listenCheck(port);
  if (!hitori) {
    clog(`Server already running.`);
  }

  try {
    if (hitori) {
      await serve((req) => {
        clog(req);
        const { response, socket } = Deno.upgradeWebSocket(req);
        socket.addEventListener("open", () => clog("[server] open !"));
        socket.addEventListener("error", () => console.log("[server] error !"));
        socket.addEventListener("close", () => clog("[server] close !"));
        socket.addEventListener(
          "message",
          async (e) => {
            clog(`[server] message ! ${e.data}`);
            if (e.data) {
              console.log(`open ${e.data}`);
              await denops.cmd(`e ${e.data}`);
            }
          },
        );
        return response;
      }, { port });
    } else {
      await denops.dispatcher.attach();
    }
  } catch (e) {
    console.log(e);
  }

  clog("dps-hitori has loaded");
}
