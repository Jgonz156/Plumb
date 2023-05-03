import assert from "assert"
import ast from "../src/ast.js"

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", ""],
  ["simplest definitions program", "Definitions{}"],
  ["simplest pipelines program", "Pipelines{}"],
  ["multiple statements", "Definitions {\nINT x <== self.bob.john()\nBOOL y <== true\n}"],
  ["variable declarations", "Definitions {\nINT a <== 7+2-(-3+4)\nINT b <== 8*4\nRAT c <== 7/2\nSTR d <== \"ka\"\n}"],
  ["prototype declarations", "Definitions {\nPROTO BOX {\nATR STR label <== \"\"\nATR STR address\nBOX FUNC Box (DNE x){\nself.label <== \"bob\"\n}\n}\n}"],
  ["function with no params, no return type", "Definitions{\nDNE FUNC e () {\nINT x <== 2\n}\n}"],
  ["function with one param", "Definitions{\nDNE FUNC e ( STR f ) {\nINT x <== 2\n}\n}"],
  ["function with two params", "Definitions{\nDNE FUNC e ( STR f, INT x ) {\nx <== 2\n}\n}"],
  ["function with no params + return type", "Definitions{\nDNE FUNC e () {\nreturn 3\n}\n}"],
  //["function types in params", "function f(g: (int)->boolean) {}"],
  //["function types returned", "function f(): (int)->(int)->void {}"],
  ["array type for param", "Definitions{\nDNE FUNC e ( ||INT|| f ) {\nINT x <== 2\n}\n}"],
  ["array type returned", "Definitions{\nDNE FUNC e () {\n||INT|| x <== ||2||\nreturn x\n}\n}"],
  //["optional types", "function f(c: int?): float {}"],
  ["assignments", "Definitions {\nx <== 2\ny <== true\n}"],
  ["complex var assignment", "Definitions {\nself.x <-- x.num[7].val()\ny <%% 38/2\n}"],
  //["complex var bumps", "c(5)[2]++;c.p.r++;c.q(8)[2](1,1).z--;"],
  ["call in statement", "Definitions {\nBOOL x <== isLarge(12)\n}"],
  ["call in exp", "Definitions {\nsetUpEnvironment()\n}"],
  ["short if", "Definitions {\nif(true){\nINT x <== 1\n}\n}"],
  //["longer if", "if true { print(1); } else { print(1); }"],
  //["even longer if", "if true { print(1); } else if false { print(1);}"],
  ["while with empty block", "Definitions {\nwhile(true){\n0\n}\n}"],
  ["while with one statement block", "Definitions {\nwhile(true){\nINT x <== 7\n}\n}"],
  //["repeat with long block", "repeat 2 { print(1);\nprint(2);print(3); }"],
  ["if inside loop", "Definitions {\nwhile(true){\nif(false){\n0\n}\n}\n}"],
  ["for-loop", "Definitions {\nfor(Int i <== 0 : i <= 3 : i<++1){\n0\n}\n}"],
  //["for half-open range", "for i in 2..<9*1 {}"],
  //["for collection-as-id", "for i in things {}"],
  //["for collection-as-lit", "for i in [3,5,8] {}"],
  ["conditional", "Definitions {\nBOOL y <== 3<8 and 3>1\n}"],
  //["??", "return a ?? b ?? c ?? d;"],
  ["ors are non-associative", "Definitions {\nwhile( (true or false) or (true or false) ){\n0\n}\n}"],
  ["ands are non-associative", "Definitions {\nif( (true and false) and (true and false) ){\n0\n}\n}"],
  //["bitwise ops", "return (1|2|3) + (4^5^6) + (7&8&9);"],
  ["relational operators", "Definitions {\nif( (10<=4 or 12>=7) or (7==6 or 9!=10) and (10>4 or 12<7) ){\n0\n}\n}"],
  //["shifts", "return 3 << 5 >> 8 << 13 >> 21;"],
  ["arithmetic", "Definitions {\nINT a <== 7+2-(-3+4)/2%9^3\n}"],
  //["length", "return #c; return #[1,2,3];"],
  ["boolean literals", "Definitions{\nBOOL a <== true or false\n}"],
  ["all numeric literal forms", "Definitions{\nINT x <== 8 * 89.123 * 1.3E5 * 1.3E+5 * 1.3E-5\n}"],
  //["empty array literal", "print(emptyArrayOf(int));"],
  //["nonempty array literal", "print([1, 2, 3]);"],
  ["empty array statement", "Definitions{\n||DNE|| x <== ||||\n}"],
  ["nonempty array statement", "Definitions{\n||STR|| x <== ||\"bob\", \"yobbel\"||\n}"],
  ["empty map statement", "Definitions{\n<<DNE>> x <== <<>>\n}"],
  ["nonempty map statement", "Definitions{\n<<BOOL>> x <== <<\"hasCar\": true, \"hasGas\": false>>\n}"],
  //["some operator", "return some dog;"],
  //["no operator", "return no dog;"],
  ["parentheses", "Definitions{\nINT x <== ((1+((((((7+2)))))*3)))+2\n}"],
  ["variables in expression", "Definitions{\nreturn r.p(3,1)[9].x.y.z.p()(5)[1]\n}"],
  ["more variables", "Definitions{\nreturn c(3).p.oh(9)[2][2].nope(1)[3](2)}"],
  //["indexing array literals", "print([1,2,3][1]);"],
  ["method expression on string literal", `Definitions{print("hello".append("there"))}`],
  ["non-Latin letters in identifiers", "Definitions{INT コンパイラ <== 100}"],
  ["a unicode string literal", 'Definitions{\nprint("hello😉😬💀🙅🏽‍♀️—`")}'],
  //["string literal with escapes", 'return "a\\n\\tbc\\\\de\\"fg";'],
  //["u-escape", 'print("\\u{a}\\u{2c}\\u{1e5}\\u{ae89}\\u{1f4a9}\\u{10ffe8}");'],
  ["end of program after comment", "Definitions{}::::"],
  ["comments with no text", "::::::::"],
  //Write pipe tests
]

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["non-letter in an identifier", "Definitions{INT ab😭c <== 2}", /Line 1, col 19:/],
  ["malformed number", "Definitions{INT x <== 2.}", /Line 1, col 25:/],
  ["a float with an E but no exponent", "Definitions{INT x <== 5E * 11}", /Line 1, col 26:/],
  ["a missing right operand", "Definitions{print(5 -)}", /Line 1, col 22:/],
  ["a non-operator", "Definitions{print(7 * ((2 _ 3))}", /Line 1, col 27:/],
  ["an expression starting with a )", "Definitions{return )}", /Line 1, col 20:/],
  ["a statement starting with expression", "Definitions{INT x * 5}", /Line 1, col 19:/],
  ["an illegal statement on line 2", "Definitions{print(5)\nINT x * 5\n}", /Line 2, col 7:/],
  ["a statement starting with a )", "Definitions{print(5)\n)\n}", /Line 2, col 1:/],
  ["an expression starting with a *", "Definitions{\nINT x <== * 71\n}", /Line 2, col 11:/],
  ["negation before exponentiation", "Definitions{\nprint(-2**2)\n}", /Line 2, col 10:/],
  ["odd operands for ands", "Definitions{\nprint(1 and 2 and 3)\n}", /Line 2, col 15:/],
  ["odd operands for ors", "Definitions{\nprint(1 or 2 or 3)\n}", /Line 2, col 14:/],
  ["associating relational operators", "Definitions{\nprint(1 < 2 < 3)\n}", /Line 2, col 13:/],
  ["while without braces", "Definitions{\nwhile true\nprint(1)\n}", /Line 2, col 7/],
  ["if without braces", "Definitions{\nif x < 3\nprint(1)\n}", /Line 2, col 4/],
  ["for as identifier", "Definitions{\nSTR for <== \"Bob\"\n}", /Line 2, col 9/],
  ["if as identifier", "Definitions{INT if <== 8}", /Line 1, col 20/],
  ["unbalanced brackets", "Definitions{\n\t||INT|| FUNC f(){\n ||INT|| x <== ||1,2,3\n}\n}", /Line 3, col 23/],
  //["empty array without type", "print([]);", /Line 1, col 9/],
  //["bad array literal", "print([1,2,]);", /Line 1, col 12/],
  ["empty subscript", "Definitions{\nprint(a[])\n}", /Line 2, col 9/],
  ["true is not assignable", "Definitions{\nINT true <== 1\n}", /Line 2, col 10/],
  ["false is not assignable", "Definitions{\nINT false <== 1\n}", /Line 2, col 11/],
  //["no-paren function type", "function f(g:int->int) {}", /Line 1, col 17/],
  //["string lit with unknown escape", 'print("ab\\zcdef");', /col 11/],
  //["string lit with newline", 'print("ab\\zcdef");', /col 11/],
  //["string lit with quote", 'print("ab\\zcdef");', /col 11/],
  //["string lit with code point too long", 'print("\\u{1111111}");', /col 17/],
  //Write pipe tests
]

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`recognizes ${scenario}`, () => {
      assert(ast(source))
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => ast(source), errorMessagePattern)
    })
  }
})