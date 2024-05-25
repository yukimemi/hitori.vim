// =============================================================================
// File        : hitori_nvim.ts
// Author      : yukimemi
// Last Change : 2024/05/25 17:52:26.
// =============================================================================

import { createCmd } from "./base.ts";

await createCmd("nvim", Deno.args);
