# dps-hitori

Plugins similar to [neovim-remote](https://github.com/mhinz/neovim-remote) and [vim-singleton](https://github.com/thinca/vim-singleton) using [denops.vim](https://github.com/vim-denops/denops.vim) .

## Require.

- [Deno - A modern runtime for JavaScript and TypeScript](https://deno.land/)
- [vim-denops/denops.vim: 🐜 An ecosystem of Vim/Neovim which allows developers to write cross-platform plugins in Deno](https://github.com/vim-denops/denops.vim)

## Config.

No settings are required. However, the following settings can be made if necessary.

```vim
" This is the default setting.
let g:hitori_debug = v:false  " debug console.log
let g:hitori_enable = v:true  " enable or disable this plugin.
let g:hitori_quit = v:true    " whether to exit after attaching
let g:hitori_port = 7070      " using websocket port
```

