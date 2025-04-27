# hitori.vim

[![DeepWiki](https://img.shields.io/badge/DeepWiki-yukimemi%2Fhitori.vim-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/yukimemi/hitori.vim)

<img src="./image.gif">

Plugin similar to [neovim-remote](https://github.com/mhinz/neovim-remote) and [vim-singleton](https://github.com/thinca/vim-singleton) using [denops.vim](https://github.com/vim-denops/denops.vim).

# Features

It uses [denops.vim](https://github.com/vim-denops/denops.vim), so it works cross-platform.
Also supports Windows.

# Installation

If you use [folke/lazy.nvim](https://github.com/folke/lazy.nvim).

```lua
{
  "yukimemi/hitori.vim",
  lazy = false,
  dependencies = {
    "vim-denops/denops.vim",
  },
}
```

If you use [yukimemi/dvpm](https://github.com/yukimemi/dvpm).

```typescript
dvpm.add({ url: "yukimemi/hitori.vim" });
```

# Requirements

- [Deno - A modern runtime for JavaScript and TypeScript](https://deno.land/)
- [vim-denops/denops.vim: 🐜 An ecosystem of Vim/Neovim which allows developers to write cross-platform plugins in Deno](https://github.com/vim-denops/denops.vim)

# Usage

No special settings are required.
By default, Start a websocket server on port 7070.

# Commands

`:Disablehitori`
Disable hitori.

`:Enablehitori`
Enable hitori.

# Config

No settings are required. However, the following settings can be made if necessary.

`g:hitori_debug`
Enable debug messages.
default is v:false

`g:hitori_opener`
Configure how files are opened.
default is "tab drop"

`g:hitori_quit`
Whether to quit after sending a file to an already open server-side Vim/Neovim.
default is v:true

`g:hitori_ignore_patterns`
A list of patterns to be ignored. (JavaScript regexp)
default is ["\\.tmp$", "\\.diff$", "(COMMIT_EDIT|TAG_EDIT|MERGE_|SQUASH_)MSG$"]

`g:hitori_port`
Websocket server port.
default is 7070

`g:hitori_wsl`
Enable this setting if you want to automatically convert the path and open it even in wsl -> windows / windows -> wsl.
default is v:false

Websocket communication needs to pass between windows and wsl.
In the case of the latest wsl2, this is possible by performing the following settings.

```ini
[wsl2]
networkingMode=mirrored
```

# Example

```vim
let g:hitori_debug = v:false
let g:hitori_quit = v:false
let g:hitori_port = 7070
let g:hitori_opener = "vsplit"
let g:hitori_wsl = v:true
let g:hitori_ignore_patterns = ["\\.tmp$", "\\.diff$", "(COMMIT_EDIT|TAG_EDIT|MERGE_|SQUASH_)MSG$"]
```

# hitori cli command

Before starting Neovim, you can use the `hitori` command to check if the WebSocket server is already running, and if it is, directly send the path of the argument via the WebSocket, otherwise start Neovim.

To use `nvim`, use the following command:

```shell
deno install --force --global --allow-net --allow-run --allow-read --name hitori https://raw.githubusercontent.com/yukimemi/hitori.vim/main/cmd/hitori_nvim.ts
```

To use `nvim-qt`, use the following command:

```shell
deno install --force --global --allow-net --allow-run --allow-read --name hitori https://raw.githubusercontent.com/yukimemi/hitori.vim/main/cmd/hitori_nvim-qt.ts
```

To use `neovide`, use the following command:

```shell
deno install --force --global --allow-net --allow-run --allow-read --name hitori https://raw.githubusercontent.com/yukimemi/hitori.vim/main/cmd/hitori_neovide.ts
```

To use `wsl neovim`, use the following command:

```shell
deno install --force --global --allow-net --allow-run --allow-read --name hitori https://raw.githubusercontent.com/yukimemi/hitori.vim/main/cmd/hitori_wslnvim.ts
```

# License

Licensed under MIT License.

Copyright (c) 2023 yukimemi

