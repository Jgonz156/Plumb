import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  ["integer variable declaration", 'Definitions{INT x <== 683}'],
  ["rational variable declaration", 'Definitions{RAT x <== 1.1234}'],
  ["boolean variable declaration", 'Definitions{BOOL x <== false}'],
  ["string variable declaration", 'Definitions{STR x <== "carrot"}'],
  ["dne variable declaration", 'Definitions{DNE x <== none}'],
  ["dne variable declaration", 'Definitions{DNE x <== all}'],
  ["complex integer variable declaration", 'Definitions{INT x <== 683 + 2}'],
  //["complex array types", "function f(x: [[[int?]]?]) {}"],
  //["increment and decrement", "let x = 10; x--; x++;"],
  ["initialize with empty array declaration", "Definitions{||INT|| x <== ||||}"],
  //["type declaration", "Definitions{PROTO BOX{ATR INT volume\nBOX FUNC BOX(INT volume){self.volume <== volume}}}"],
  ["assign arrays", "Definitions{||INT|| x <== ||1,2,3||}"],
  ["assign to array element", "Definitions{||INT|| x <== ||||\n x.append(2)}"],
  //["initialize with empty optional", "let a = no int;"],
  ["short return", "Definitions{STR FUNC boberino(STR x){return}}"],
  ["long return", "Definitions{STR FUNC boberino(STR x){return x}}"],
  //["assign optionals", "let a = no int;let b=some 1;a=b;b=a;"],
  ["return in nested if", "Definitions{STR FUNC boberino(STR x){if(true){return x}}}"],
  ["break in nested if", "Definitions{while(true){if(true){break}}}"],
  ["short if", "Definitions{if(true){INT x <== 2}}"],
  //["else if", "if true {print(1);} else if true {print(0);} else {print(3);}"],
  //["for over collection", "for i in [2,3,5] {print(1);}"],
  ["for loop", "Definitions{for(INT x <== 0 : x<10 : x<++1){print(45)}}"],
  //["repeat", "repeat 3 {let a = 1; print(a);}"],
  //["conditionals with ints", "print(true ? 8 : 5);"],
  //["conditionals with floats", "print(1<2 ? 8.0 : -5.22);"],
  //["conditionals with strings", 'print(1<2 ? "x" : "y");'],
  //["??", "print(some 5 ?? 0);"],
  //["nested ??", "print(some 5 ?? 8 ?? 0);"],
  ["||", "Definitions{print(true or false)}"],
  ["&&", "Definitions{print(true and false)}"],
  //["bit ops", "print((1&2)|(9^3));"],
  ["relations", 'Definitions{print((4<5 and 2<=2) and (10>2 and 2>=2))}'],
  //["ok to == arrays", "print([1]==[5,8]);"],
  //["ok to != arrays", "print([1]!=[5,8]);"],
  //["shifts", "print(1<<3<<5<<8>>2>>0);"],
  ["arithmetic", "Definitions{INT x <== ((232-54+23*7)^8) % 2000}"],
  //["array length", "print(#[1,2,3]);"],
  //["optional types", "let x = no int; x = some 100;"],
  ["variables", "Definitions{INT x <== 2 \n print(x)}"],
  //["recursive structs", "struct S {z: S?} let x = S(no S);"],
  //["nested structs", "struct T{y:int} struct S{z: T} let x=S(T(1)); print(x.z.y);"],
  [
     "member exp", 
     `Definitions {
        PROTO BOX {
            ATR INT volume
            BOX FUNC BOX(INT volume) {
                self.volume <== volume
            }
        }
        BOX x <== BOX(5)
        print(x.volume)
      }
    `
    ],
  ["subscript exp", "Definitions{||INT|| x <== ||1,2,3|| \n print(x[0])}"],
  //["array of struct", "struct S{} let x=[S(), S()];"],
  //["struct of arrays and opts", "struct S{x: [int] y: string??}"],
  //["assigned functions", "function f() {}\nlet g = f;g = f;"],
  //["call of assigned functions", "function f(x: int) {}\nlet g=f;g(1);"],
  //["type equivalence of nested arrays", "function f(x: [[int]]) {} print(f([[1],[2]]));"],
  /*
  [
    "call of assigned function in expression",
    `function f(x: int, y: boolean): int {}
    let g = f;
    print(g(1, true));
    f = g; // Type check here`,
  ],
  [
    "pass a function to a function",
    `function f(x: int, y: (boolean)->void): int { return 1; }
     function g(z: boolean) {}
     f(2, g);`,
  ],
  [
    "function return types",
    `function square(x: int): int { return x * x; }
     function compose(): (int)->int { return square; }`,
  ],
  ["function assign", "function f() {} let g = f; let h = [g, f]; print(h[0]());"],
  ["struct parameters", "struct S {} function f(x: S) {}"],
  ["array parameters", "function f(x: [int?]) {}"],
  ["optional parameters", "function f(x: [int], y: string?) {}"],
  ["empty optional types", "print(no [int]); print(no string);"],
  ["types in function type", "function f(g: (int?, float)->string) {}"],
  ["voids in fn type", "function f(g: (void)->void) {}"],
  ["outer variable", "let x=1; while(false) {print(x);}"],
  */
  //["built-in constants", "print(25.0 * π);"],
  //["built-in sin", "print(sin(π));"],
  //["built-in cos", "print(cos(93.999));"],
  //["built-in hypot", "print(hypot(-4.0, 3.00001));"],
  ["basic injection pipe", "Definitions{INT x <== 683}Pipelines{x --> print}"],
  ["multiple basic injection pipes", "Definitions{INT x <== 683\n BOOL y <== true}Pipelines{x --> print\n y --> print}"],
  ["complicated injection pipe", "Definitions{INT x <== 683\n INT FUNC subtractOne(INT a){return a - 1}}Pipelines{x --> subtractOne --> print}"]
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  //["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  /*
  ["non-int increment", "let x=false;x++;", /an integer/],
  ["non-int decrement", 'let x=some[""];x++;', /an integer/],
  ["undeclared id", "print(x);", /Identifier x not declared/],
  ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  ["recursive struct", "struct S { x: int y: S }", /must not be recursive/],
  ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
  ["assign bad type", "let x=1;x=true;", /Cannot assign a boolean to a int/],
  ["assign bad array type", "let x=1;x=[true];", /Cannot assign a \[boolean\] to a int/],
  ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while true {function f() {break;}}",
    /Break can only appear in a loop/,
  ],
  ["return outside function", "return;", /Return can only appear in a function/],
  [
    "return value from void function",
    "function f() {return 1;}",
    /Cannot return a value here/,
  ],
  [
    "return nothing from non-void",
    "function f(): int {return;}",
    /should be returned here/,
  ],
  ["return type mismatch", "function f(): int {return false;}", /boolean to a int/],
  ["non-boolean short if test", "if 1 {}", /Expected a boolean/],
  ["non-boolean if test", "if 1 {} else {}", /Expected a boolean/],
  ["non-boolean while test", "while 1 {}", /Expected a boolean/],
  ["non-integer repeat", 'repeat "1" {}', /Expected an integer/],
  ["non-integer low range", "for i in true...2 {}", /Expected an integer/],
  ["non-integer high range", "for i in 1..<no int {}", /Expected an integer/],
  ["non-array in for", "for i in 100 {}", /Array expected/],
  ["non-boolean conditional test", "print(1?2:3);", /Expected a boolean/],
  ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
  ["unwrap non-optional", "print(1??2);", /Optional expected/],
  ["bad types for ||", "print(false||1);", /Expected a boolean/],
  ["bad types for &&", "print(false&&1);", /Expected a boolean/],
  ["bad types for ==", "print(false==1);", /Operands do not have the same type/],
  ["bad types for !=", "print(false==1);", /Operands do not have the same type/],
  ["bad types for +", "print(false+1);", /Expected a number or string/],
  ["bad types for -", "print(false-1);", /Expected a number/],
  ["bad types for *", "print(false*1);", /Expected a number/],
  ["bad types for /", "print(false/1);", /Expected a number/],
  ["bad types for **", "print(false**1);", /Expected a number/],
  ["bad types for <", "print(false<1);", /Expected a number or string/],
  ["bad types for <=", "print(false<=1);", /Expected a number or string/],
  ["bad types for >", "print(false>1);", /Expected a number or string/],
  ["bad types for >=", "print(false>=1);", /Expected a number or string/],
  ["bad types for ==", "print(2==2.0);", /not have the same type/],
  ["bad types for !=", "print(false!=1);", /not have the same type/],
  ["bad types for negation", "print(-true);", /Expected a number/],
  ["bad types for length", "print(#false);", /Array expected/],
  ["bad types for not", 'print(!"hello");', /Expected a boolean/],
  ["non-integer index", "let a=[1];print(a[false]);", /Expected an integer/],
  ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
  ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  [
    "Too many args",
    "function f(x: int) {}\nf(1,2);",
    /1 argument\(s\) required but 2 passed/,
  ],
  [
    "Too few args",
    "function f(x: int) {}\nf();",
    /1 argument\(s\) required but 0 passed/,
  ],
  [
    "Parameter type mismatch",
    "function f(x: int) {}\nf(false);",
    /Cannot assign a boolean to a int/,
  ],
  [
    "function type mismatch",
    `function f(x: int, y: (boolean)->void): int { return 1; }
     function g(z: boolean): int { return 5; }
     f(2, g);`,
    /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  ],
  ["bad call to stdlib sin()", "print(sin(true));", /Cannot assign a boolean to a float/],
  ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  ["Non-type in return type", "let x=1;function f():x{return 1;}", /Type expected/],
  ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
  */
]

// Test cases for expected semantic graphs after processing the AST. In general
// this suite of cases should have a test for each kind of node, including
// nodes that get rewritten as well as those that are just "passed through"
// by the analyzer. For now, we're just testing the various rewrites only.

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      console.log(ast(source))
      let analyzedAst = analyze(ast(source))
      assert.ok(analyzedAst)
      console.log(analyzedAst)
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(ast(source)), errorMessagePattern)
    })
  }
})