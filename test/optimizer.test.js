import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

const x = new core.VariableObj("DNE", "x")
const y = new core.VariableDec("DNE", "y", "<==", "1")
const return1p1 = new core.ReturnStatement(new core.BinaryExpression(1, "+", 1))
const return2 = new core.ReturnStatement(2)
const returnx = new core.ReturnStatement(x)
const onePlusTwo = new core.BinaryExpression(1, "+", 2)
const intfunc = body => new core.FunctionDec("INT", "f", [], [body])
const index = (o, i) => new core.IndexExpression(o, i)
const neg = a => new core.UnaryExpression("-", a)
const or = (...a) => a.reduce((x,y) => new core.BinaryExpression(x, "or", y)) 
const and = (...a) => a.reduce((x,y) => new core.BinaryExpression(x, "and", y))
const less = (x, y) => new core.BinaryExpression(x, "<", y)
const eq = (x, y) => new core.BinaryExpression(x, "==", y)
const times = (x, y) => new core.BinaryExpression(x, "*", y)
const array = (...elements) => new core.ListExp("DNE", elements)
const piper = (...inputs) => new core.PipeDec(inputs, "-->", null)


const tests = [
    ["folds +", new core.BinaryExpression(5, "+", 8), 13],
    ["folds +", new core.BinaryExpression(5, "-", 8), -3],
    ["folds *", new core.BinaryExpression(5, "*", 8), 40],
    ["folds /", new core.BinaryExpression(5, "/", 8), 0.625],
    ["folds ^", new core.BinaryExpression(5, "^", 8), 390625],
    ["folds <", new core.BinaryExpression(5, "<", 8), true],
    ["folds <=", new core.BinaryExpression(5, "<=", 8), true],
    ["folds ==", new core.BinaryExpression(5, "==", 8), false],
    ["folds !=", new core.BinaryExpression(5, "!=", 8), true],
    ["folds >=", new core.BinaryExpression(5, ">=", 8), false],
    ["folds >", new core.BinaryExpression(5, ">", 8), false],
    ["optimizes +0", new core.BinaryExpression(x, "+", 0), x],
    ["optimizes -0", new core.BinaryExpression(x, "-", 0), x],
    ["optimizes *1", new core.BinaryExpression(x, "*", 1), x],
    ["optimizes /1", new core.BinaryExpression(x, "/", 1), x],
    ["optimizes *0", new core.BinaryExpression(x, "*", 0), 0],
    ["optimizes 0*", new core.BinaryExpression(0, "*", x), 0],
    ["optimizes 0/", new core.BinaryExpression(0, "/", x), 0],
    ["optimizes 0+", new core.BinaryExpression(0, "+", x), x],
    ["optimizes 0-", new core.BinaryExpression(0, "-", x), neg(x)],
    ["optimizes 1*", new core.BinaryExpression(1, "*", x), x],
    ["folds negation", new core.UnaryExpression("-", 8), -8],
    ["optimizes 1^", new core.BinaryExpression(1, "^", x), 1],
    ["optimizes ^0", new core.BinaryExpression(x, "^", 0), 1],
    ["removes left false from or", or(false, less(x, 1)), less(x, 1)],
    ["removes right false from or", or(less(x, 1), false), less(x, 1)],
    ["removes left true from and", and(true, less(x, 1)), less(x, 1)],
    ["removes right true from and", and(less(x, 1), true), less(x, 1)],
    ["removes x=x at beginning", [new core.Assignment(null, x, "<==", x), 1], [1]],
    ["removes x=x at end", [1, new core.Assignment(null, x, "<==", x)], [1]],
    ["removes x=x at middle", [1, new core.Assignment(null, x, "<==", x), 1], [1,1]],
    ["optimizes if-true", new core.IfStatement(true, x), x],
    ["optimizes if-false", new core.IfStatement(false, [x]), []],
    ["optimizes while-false", new core.WhileStatement(false, [x]), []],
    ["optimizes for-false", new core.ForStatement(y, false, new core.Assignment(null, "y", "<++", "1"), [x]), []],
    ["optimizes if with folded false", new core.IfStatement(eq(1,2), [x]), []],
    ["optimizes if with folded true", new core.IfStatement(eq(1,1), [x]), [x]],
    ["optimizes in functions", intfunc(return1p1), intfunc(return2)],
    ["optimizes in index", index(x, onePlusTwo), index(x, 3)],
    ["optimizes in lists", array(0, onePlusTwo, 9), array(0, 3, 9)],
    //["optimizes in calls", intfunc(return1p1), intfunc(return2)],
    //[]
    ["optimizes in pipes", piper(onePlusTwo), piper(3)]
    //["optimizes in multiple pipes", new core.Pipe([3, onePlusTwo], "-->", new core.Pipe()), ]
]

describe("The optimizer", () => {
    for (const [scenario, before, after] of tests) {
      it(`${scenario}`, () => {
        assert.deepEqual(optimize(before), after)
      })
    }
  })