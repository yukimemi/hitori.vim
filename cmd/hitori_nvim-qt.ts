// =============================================================================
// File        : hitori_nvim-qt.ts
// Author      : yukimemi
// Last Change : 2025/01/02 15:37:31.
// =============================================================================

import { createCmd } from "./base.ts";

await createCmd(["nvim-qt"], Deno.args);
