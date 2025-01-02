// =============================================================================
// File        : hitori_nvim.ts
// Author      : yukimemi
// Last Change : 2025/01/02 15:37:11.
// =============================================================================

import { createCmd } from "./base.ts";

await createCmd(["nvim"], Deno.args);
