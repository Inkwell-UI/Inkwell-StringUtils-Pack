// Checks every template against its node definition, then evaluates each rendered expression in JS (the expressions are
// valid in both JS and AS2) against known answers. Uses the Core Pack's test renderer: inputs become IN_<pin>.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPack, checkTemplate, render, fixtureFields } from "@inkwell-ui/core-pack/scripts/lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { manifest, nodes } = loadPack(root);
const byKind = Object.fromEntries(nodes.map((n) => [n.def.kind, n]));

test("every template agrees with its pins and fields", () => {
  for (const n of nodes) assert.deepEqual(checkTemplate(n.def, n.text, manifest.id), [], n.id);
});

test("every node is pure with one 'value' output", () => {
  for (const n of nodes) {
    assert.equal(n.def.pure, true, n.id);
    assert.deepEqual(n.def.outputs.map((o) => o.name), ["value"], n.id);
  }
});

// run(kind, inputs, fields): render the template, bind the inputs and evaluate the expression line.
const run = (kind, inputs, fields = {}) => {
  const { def, text } = byKind[kind];
  const expr = render(def, text, { ...fixtureFields(def), ...fields }).split("\n")[1];
  const names = def.inputs.map((p) => p.name);
  return new Function(...names.map((n) => "IN_" + n), `return ${expr};`)(...names.map((n) => inputs[n] ?? def.inputs.find((p) => p.name === n).default));
};

const cases = [
  ["Trim", { text: " \t a b \r\n" }, {}, "a b"],
  ["Trim", { text: "  a  " }, { mode: "start" }, "a  "],
  ["Trim", { text: "  a  " }, { mode: "end" }, "  a"],
  ["Trim", { text: "   " }, {}, ""],
  ["CollapseSpaces", { text: "  a   b\t\tc  " }, {}, "a b c"],
  ["RemoveWhitespace", { text: " a b\tc\n" }, {}, "abc"],
  ["IsEmpty", { text: " \t" }, {}, true],
  ["IsEmpty", { text: "" }, {}, true],
  ["IsEmpty", { text: " x " }, {}, false],
  ["DefaultIfEmpty", { text: "  ", fallback: "n/a" }, {}, "n/a"],
  ["DefaultIfEmpty", { text: " hi ", fallback: "n/a" }, {}, " hi "],
  ["Coalesce", { a: "", b: "b" }, {}, "b"],
  ["Coalesce", { a: "a", b: "b" }, {}, "a"],
  ["Contains", { text: "Iron Sword", find: "sword" }, {}, false],
  ["Contains", { text: "Iron Sword", find: "sword" }, { ignoreCase: true }, true],
  ["StartsWith", { text: "Iron Sword", prefix: "iron" }, { ignoreCase: true }, true],
  ["StartsWith", { text: "Iron Sword", prefix: "Sword" }, {}, false],
  ["EndsWith", { text: "Iron Sword", suffix: "Sword" }, {}, true],
  ["EndsWith", { text: "ab", suffix: "xab" }, {}, false],
  ["EndsWith", { text: "ab", suffix: "" }, {}, true],
  ["IndexOf", { text: "banana", find: "an", from: 2 }, {}, 3],
  ["IndexOf", { text: "banana", find: "x" }, {}, -1],
  ["CountOccurrences", { text: "banana", find: "an" }, {}, 2],
  ["CountOccurrences", { text: "banana", find: "" }, {}, 0],
  ["EqualsIgnoreCase", { a: "AbC", b: "aBc" }, {}, true],
  ["Left", { text: "hello", count: 2 }, {}, "he"],
  ["Left", { text: "hello", count: -1 }, {}, ""],
  ["Right", { text: "hello", count: 2 }, {}, "lo"],
  ["Right", { text: "hello", count: 0 }, {}, ""],
  ["Right", { text: "hello", count: 99 }, {}, "hello"],
  ["CharAt", { text: "hello", index: 1 }, {}, "e"],
  ["CharAt", { text: "hello", index: 9 }, {}, ""],
  ["CharAt", { text: "hello", index: -1 }, {}, ""],
  ["SubstringBefore", { text: "a.b.c", delimiter: "." }, {}, "a"],
  ["SubstringBefore", { text: "a.b.c", delimiter: "." }, { last: true }, "a.b"],
  ["SubstringBefore", { text: "abc", delimiter: "." }, {}, "abc"],
  ["SubstringAfter", { text: "a.b.c", delimiter: "." }, {}, "b.c"],
  ["SubstringAfter", { text: "a.b.c", delimiter: "." }, { last: true }, "c"],
  ["SubstringAfter", { text: "abc", delimiter: "." }, {}, ""],
  ["SplitGet", { text: "a,b,c", index: 1 }, {}, "b"],
  ["SplitGet", { text: "a,b,c", index: 3 }, {}, ""],
  ["SplitGet", { text: "a,b,c", index: -1 }, {}, ""],
  ["Truncate", { text: "Hello World", max: 8 }, {}, "Hello..."],
  ["Truncate", { text: "Hello", max: 8 }, {}, "Hello"],
  ["Truncate", { text: "Hello World", max: 2 }, {}, ".."],
  ["Repeat", { text: "ab", count: 3 }, {}, "ababab"],
  ["Repeat", { text: "ab", count: -2 }, {}, ""],
  ["Pad", { text: "7", length: 3, char: "0" }, {}, "007"],
  ["Pad", { text: "7", length: 3, char: "0" }, { side: "end" }, "700"],
  ["Pad", { text: "7", length: 6, char: "ab" }, {}, "ababa7"],
  ["Pad", { text: "long", length: 2, char: "0" }, {}, "long"],
  ["Pad", { text: "7", length: 3, char: "" }, {}, "7"],
  ["Reverse", { text: "abc" }, {}, "cba"],
  ["Capitalize", { text: "hello world" }, {}, "Hello world"],
  ["Capitalize", { text: "" }, {}, ""],
  ["TitleCase", { text: "the iron\tsword" }, {}, "The Iron\tSword"],
  ["IsNumeric", { text: "12.5" }, {}, true],
  ["IsNumeric", { text: " -3 " }, {}, true],
  ["IsNumeric", { text: "12a" }, {}, false],
  ["IsNumeric", { text: "  " }, {}, false],
  ["IsNumeric", { text: "" }, {}, false],
  ["FormatThousands", { value: 1234567 }, {}, "1,234,567"],
  ["FormatThousands", { value: -1234.5, separator: " " }, {}, "-1 234.5"],
  ["FormatThousands", { value: 999 }, {}, "999"],
  ["FormatThousands", { value: 0 }, {}, "0"],
  ["CharCode", { text: "A" }, {}, 65],
  ["CharCode", { text: "" }, {}, 0],
  ["FromCharCode", { code: 66 }, {}, "B"],
  ["FromCharCode", { code: 0 }, {}, ""],
  ["EscapeHtml", { text: "<b>Tom & Jerry</b>" }, {}, "&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;"],
  ["StripHtmlTags", { text: "<b>Hi</b> <font color='#fff'>you</font>" }, {}, "Hi you"],
  ["StripHtmlTags", { text: "a > b" }, {}, "a > b"],
];

for (const [kind, inputs, fields, want] of cases)
  test(`${kind} ${JSON.stringify(inputs)} ${JSON.stringify(fields)}`, () => assert.equal(run(kind, inputs, fields), want));

test("every node has at least one behavior case", () => {
  const covered = new Set(cases.map((c) => c[0]));
  for (const k of Object.keys(byKind)) assert.ok(covered.has(k), k);
});
