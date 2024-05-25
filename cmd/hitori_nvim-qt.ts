// =============================================================================
// File        : hitori_nvim-qt.ts
// Author      : yukimemi
// Last Change : 2024/05/25 17:52:01.
// =============================================================================

import { createCmd } from "./base.ts";

await createCmd("nvim-qt", Deno.args);
