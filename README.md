# StringUtils

An Inkwell node pack with 30 common text utilities (Trim, Pad, Truncate, Split Get, Format Thousands, Escape HTML and more), all pure nodes in the category Text. Pack id `stringutils`; nodes are `stringutils/<Kind>@1`. See `CHANGELOG.md` for the list.

```
manifest.json        pack id, version, compatible tool range
nodes/<Kind>.json    one node definition per file
templates/<Kind>.as2 the AS2 each node generates (one expression)
test/                node --test: templates agree with their pins, and every node has known-answer cases
```

Commands (Inkwell-Core-Pack and Inkwell-Spec checked out next to this folder; run `yarn build` in Inkwell-Spec once): `yarn install`, `yarn validate`, `yarn test`.

Add it in the editor with Assets > Node packs > Add Pack and `owner/repo`. Release: bump `version` in `manifest.json`, add a `CHANGELOG.md` entry, push the tag `v<version>`.

Limits: whitespace is space, tab, CR and LF; Is Numeric accepts what AS2 `Number()` accepts (including hex like `0x1F`); Repeat and Pad cap at 1000.
