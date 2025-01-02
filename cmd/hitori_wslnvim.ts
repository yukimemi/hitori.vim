// =============================================================================
// File        : hitori_wslnvim.ts
// Author      : yukimemi
// Last Change : 2025/01/02 15:38:55.
// =============================================================================

import { createCmd } from "./base.ts";

await createCmd(["wsl", "--shell-type", "login", "nvim"], Deno.args);
