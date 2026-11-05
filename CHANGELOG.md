# Changelog

## 0.1.2

Supports any Inkwell from 0.5.0 on (compatible.tool is now >=0.5.0 instead of ^0.x). No node, pin, field or template changed.

## 0.1.1

Every node now has an Inspector description. No pin, field or template changed.

## 0.1.0

First release: 30 pure text nodes (category Text), all `stringutils/<Kind>@1`.

- Trim and clean: Trim, Collapse Spaces, Remove Whitespace, Is Empty, Default If Empty, Coalesce.
- Search: Contains, Starts With, Ends With (all with an `ignoreCase` field), Index Of, Count Occurrences, Equals Ignore Case.
- Extract: Left, Right, Char At, Substring Before, Substring After, Split Get, Truncate.
- Build: Repeat, Pad, Reverse, Capitalize, Title Case.
- Convert: Is Numeric, Format Thousands, Char Code, From Char Code, Escape HTML, Strip HTML Tags.

Whitespace means space, tab, CR and LF. Repeat and Pad cap their result at 1000 repeats / characters.
