import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const plumbGrammar = ohm.grammar(fs.readFileSync("src/carlos.ohm"))

const astBuilder = plumbGrammar.createSemantics().addOperation("ast", {
    Program(_n0, imports, _n1, definition, _n2, pipeline, _n4, _end){
        return new core.Program(
            imports.ast(), 
            definition.ast(), 
            pipeline.ast()
        )
    },
    Import(_n0, _imp, path, _n1){
        return new core.Import(path.sourceString)
    },
    Definitions(_defn, block){
        return new core.Definitions(block.ast())
    },
    Statement_Newline(_n0, statement, _n1){
        return new core.Statement(statement.ast())
    },
    Statement(statement){
        return new core.Statement(statement.ast())
    },
    VariableDec(prototype, id, assignment, expression){
        return new core.VariableDec(
            prototype.sourceString, 
            id.sourceString, 
            assignment.ast(), 
            expression.ast()
        )
    },
    Assignment(self, _dot, id, assignment, expression){
        return new core.Assignment(
            self.sourceString, 
            id.sourceString, 
            assignment.sourceString, 
            expression.ast()
        )
    },
    FunctionDec(prototype, _func, id, _lp, parameters, _rp, block){
        return new core.FunctionDec(
            prototype.sourceString,
            id.sourceString,
            parameters.ast(),
            block.ast()
        )
    },
    PrototypeDec(_proto, id, block){
        return new core.PrototypeDec(
            id.sourceString, 
            block.ast()
        )
    },
    AttributeDec(_atr, prototype, id, assignment, expression){
        return new core.AttributeDec(
            prototype.sourceString, 
            id.sourceString, 
            assignment.sourceString, 
            expression.ast()
        )
    },
    IfStatement(_if, _lp, expression, _rp, block){
        return new core.IfStatement(
            expression.ast(),
            block.ast()
        )
    },
    WhileStatement(_while, _lp, expression, _rp, block){
        return new core.WhileStatement(
            expression.ast(), 
            block.ast()
        )
    },
    ForStatement(_for, _lp, statement0, _colon0, expression, _colon1, statement1, block){
        return new core.ForStatment(
            statement0.ast(),
            expression.ast(),
            statement1.ast(),
            block.ast()
        )
    },
    ReturnStatement(_return, expression){
        return new core.ReturnStatement(expression.ast())
    },
    ListDec(_pipe0, prototype, _pipe1, id, assignment, list){
        return new core.ListDec(
            prototype.sourceString, 
            id.sourceString,
            assignment.sourceString, 
            list.ast()
        )
    },
    MapDec(_wall0, prototype, _wall1, id, assignment, map){
        return new core.MapDec(
            prototype.sourceString,
            id.sourceString,
            assignment.sourceString,
            map.ast()
        )
    },
    Block(_lb, statements, _rb, _n){
        return new core.Statement(statements.ast())
    },
    Expression_BooleanOR(left, or, right){
        return new core.BinaryExpression(
            left.ast(),
            or.sourceString,
            right.ast()
        )
    },
    Exp1_BooleanAND(left, and, right){
        return new core.BinaryExpression(
            left.ast(),
            and.sourceString,
            right.ast()
        )
    },
    Exp2_BooleanEquality(left, op, right){
        return new core.BinaryExpression(
            left.ast(),
            op.sourceString,
            right.ast()
        )
    },
    Exp3_BooleanConditionals(left, op, right){
        return new core.BinaryExpression(
            left.ast(),
            op.sourceString,
            right.ast()
        )
    },
    Exp4_AdditionSubtraction(left, op, right){
        return new core.BinaryExpression(
            left.ast(),
            op.sourceString,
            right.ast()
        )
    },
    Exp5_MultiplicationDivisionModulus(left, op, right){
        return new core.BinaryExpression(
            left.ast(),
            op.sourceString,
            right.ast()
        )
    },
    Exp6_Exponentiation(left, pow, right){
        return new core.BinaryExpression(
            left.ast(),
            pow.sourceString,
            right.ast()
        )
    },
    Exp6_Negation(op, right){
        return new core.UnaryExpression(
            op.sourceString,
            right.ast()
        )
    },
    Exp7(){

    },
    
})