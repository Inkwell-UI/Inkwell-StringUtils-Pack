# Changelog

## 0.1.0

First release: 30 pure text nodes (category Text), all `stringutils/<Kind>@1`.

- Trim and clean: Trim, Collapse Spaces, Remove Whitespace, Is Empty, Default If Empty, Coalesce.
- Search: Contains, Starts With, Ends With (all with an `ignoreCase` field), Index Of, Count Occurrences, Equals Ignore Case.
- Extract: Left, Right, Char At, Substring Before, Substring After, Split Get, Truncate.
- Build: Repeat, Pad, Reverse, Capitalize, Title Case.
- Convert: Is Numeric, Format Thousands, Char Code, From Char Code, Escape HTML, Strip HTML Tags.

Whitespace means space, tab, CR and LF. Repeat and Pad cap their result at 1000 repeats / characters.
