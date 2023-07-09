# dps-hitori

Plugin similar to [neovim-remote](https://github.com/mhinz/neovim-remote) and [vim-singleton](https://github.com/thinca/vim-singleton) using [denops.vim](https://github.com/vim-denops/denops.vim).

# Features 

It uses [denops.vim](https://github.com/vim-denops/denops.vim), so it works cross-platform.
Also supports Windows.

# Installation 

If you use [folke/lazy.nvim](https://github.com/folke/lazy.nvim).

```
  {
    "yukimemi/dps-hitori",
    lazy = false,
    dependencies = {
      "vim-denops/denops.vim",
    },
  }
```

If you use [yukimemi/dvpm](https://github.com/yukimemi/dvpm).

```
  dvpm.add({ url: "yukimemi/dps-hitori" });
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

`g:hitori_quit`                                                
Whether to quit after sending a file to an already open server-side Vim/Neovim.
default is v:true

`g:hitori_ignore_patterns`                          
A list of patterns to be ignored. (JavaScript regexp)
default is ["\\.tmp$", "\\.diff$", "(COMMIT_EDIT|TAG_EDIT|MERGE_|SQUASH_)MSG$"]

`g:hitori_port`                                                
Websocket server port.
default is 7070

# Example 

```
  let g:hitori_debug = v:false
  let g:hitori_quit = v:false
  let g:hitori_port = 7070
  let g:hitori_blacklist_patterns = ["\\.tmp$", "\\.diff$", "(COMMIT_EDIT|TAG_EDIT|MERGE_|SQUASH_)MSG$"]
```

# License 

Licensed under MIT License.

Copyright (c) 2023 yukimemi

