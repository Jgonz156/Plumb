import assert from "assert/strict"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
    return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
    {
        name: "Basic Variable Decleration",
        source: `
        Definitions{
            INT x <== 1
        }
        `,
        expected: dedent`
            let x_1 = 1
        `
    },
    {
        name: "Basic Assignment",
        source: `
        Definitions{
            INT x <== 1
            x <== 2
        }
        `,
        expected: dedent`
            let x_1 = 1
            x_1 <== 2
        `
    },
    {
        name: "Basic Function Decleration",
        source: `
        Definitions{
            INT FUNC next(INT x){
                return x + 1
            }
        }
        `,
        expected: dedent`
            function next_1(x_2){
                return x_2 + 1
            }
        `
    },
    {
        name: "Basic Prototype Decleration",
        source: `
        Definitions{
            PROTO CUBE{
                ATR INT l
                CUBE FUNC CUBE(INT x){
                    self.l <== x
                }
            }
        }
        `,
        expected: dedent`
            class CUBE_1{
                #l_1
                constructor(x_2){
                    this.l_1 = x_2
                }
            }
        `
    },
    {
        name: "Basic If Statement",
        source: `
        Definitions{
            BOOL x <== true
            if(x){
                x <== false
            }
        }
        `,
        expected: dedent`
            let x_1 = true
            if(x_1){
                x = false
            }
        `
    },
    {
        name: "Basic While Statement",
        source: `
        Definitions{
            BOOL x <== true
            while(x){
                x <== false
            }
        }
        `,
        expected: dedent`
            let x_1 = true
            while(x_1){
                x = false
            }
        `
    },
    {
        name: "Basic For Statement",
        source: `
        Definitions{
            INT total <== 0
            for(INT x <== 0: x < 10: x <++ 1){
                total <++ 1
            }
        }
        `,
        expected: dedent`
            let total_1 = 0
            for(let x_2 = 0; x_2 < 10; x_2 += 1){
                total_1 += 1
            }
        `
    },
    {
        name: "Basic Call",
        source: `
        Definitions{
            INT FUNC next(INT x){
                return x + 1
            }
        }
        `,
        expected: dedent`
            function next_1(x_2){
                return x_2 + 1
            }
            next_1(1)
        `
    },
    {
        name: "Basic Variable Declerations",
        source: `
        Definitions{
            INT x <== 1
            RAT y <== 1.1
            BOOL z <== true
            STR a <== "bob"
            DNE b <== 1
            DNE c <== "oops"
            DNE d <== none
            DNE e <== all
        }
        `,
        expected: dedent`
            let x_1 = 1
            let y_2 = 1.1
            let z_3 = true
            let a_4 = "bob"
            let b_5 = 1
            let c_6 = "oops"
            let d_7 = null
            let e_8 = undefined
        `
    },
    {
        name: "Intermediate Variable Decleration",
        source: `
        Definitions{
            ||INT|| x <== ||1, 2|| 
        }
        `,
        expected: dedent`
            let x_1 = [1, 2]
        `
    },
    {
        name: "Intermediate Variable Declerations",
        source: `
        Definitions{
            ||INT|| x <== ||1, 2||
            ||BOOL|| y <== ||true, false||
            ||DNE|| z <== ||none, 1, 1.1, "string"||
            <<INT>> a <== << "car":12, "wheels":4 >>
            <<STR>> b <== << "car":"twelve", "wheels":"four" >>
            <<BOOL>> c <== << "car":true, "wheels":true >>
        }
        `,
        expected: dedent`
            let x_1 = [1, 2]
            let y_2 = [true, false]
            let z_3 = [null, 1, 1.1, "string"]
            let a_4 = new Map([["car", 12], ["wheels", 4]])
            let b_5 = new Map([["car", "twelve"], ["wheels", "four"]])
            let c_6 = new Map([["car", true], ["wheels", true]])
        `
    },
    {
        name: "Complicated Variable Decleration",
        source: `
        Definitions{
            INT x <== 1
            INT y <== 1
            INT z <== x + y
        }
        `,
        expected: dedent`
            let x_1 = 1
            let y_2 = 1
            let z_3 = x_1 + y_2
        `
    },
    {
        name: "Complicated Variable Declerations",
        source: `
        Definitions{
            DNE x <== 1
            INT y <== 1
            INT z <== x + y
        }
        `,
        expected: dedent`
            let x_1 = 1
            let y_2 = 1
            let z_3 = x_1 + y_2
        `
    },
]


describe("The code generator", () => {
    for (const fixture of fixtures) {
      it(`produces expected js output for the ${fixture.name} program`, () => {
        const actual = generate(optimize(analyze(ast(fixture.source))))
        assert.deepEqual(actual, fixture.expected)
      })
    }
  })