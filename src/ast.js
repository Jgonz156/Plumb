import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const plumbGrammar = ohm.grammar(fs.readFileSync("src/plumb.ohm"))

const astBuilder = plumbGrammar.createSemantics().addOperation("ast", {
    Program(_n0, imports, _n1, definition, _n2, pipeline, _n4, _end){
        return new core.Program(
            imports.ast()[0] ?? null, 
            definition.ast()[0] ?? null, 
            pipeline.ast()[0] ?? null
        )
    },
    Import(_n0, _imp, path, _n1){
        return new core.ImportDec(path.sourceString)
    },
    Definitions(_defn, block){
        return new core.Definitions(block.ast())
    },
    Statement_Newlines(_n0, statement, _n1){
        return statement.ast()
    },
    Statement(statement){
        return statement.ast()
    },
    VariableDec(prototype, id, assignment, expression){
        return new core.VariableDec(
            prototype.sourceString, 
            id.ast(), 
            assignment.ast(), 
            expression.ast()
        )
    },
    Assignment(self, _dot, id, assignment, expression){
        return new core.Assignment(
            self.sourceString[0] ?? null, 
            id.ast(), 
            assignment.ast(), 
            expression.ast()
        )
    },
    FunctionDec(prototype, _func, id, _lp, parameters, _rp, block){
        return new core.FunctionDec(
            prototype.sourceString,
            id.ast(),
            parameters.asIteration().ast(),
            block.ast()
        )
    },
    typeParameterPair(prototype, _space, id){
        return new core.Token(`${prototype.sourceString} Parameter`, this.source)
    },
    PrototypeDec(_proto, id, block){
        return new core.PrototypeDec(
            id.ast(), 
            block.ast()
        )
    },
    AttributeDec(_atr, prototype, id, assignment, expression){
        return new core.AttributeDec(
            prototype.sourceString, 
            id.ast(), 
            assignment.ast(), 
            expression.ast()
        )
    },
    MethodDec(_atr, prototype, _func, id, _lp, parameters, _rp, block){
        return new core.MethodDec(
            prototype.sourceString,
            id.ast(),
            parameters.asIteration().ast(),
            block.ast()
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
    ForStatement(_for, _lp, statement0, _colon0, expression, _colon1, statement1, _rp, block){
        return new core.ForStatement(
            statement0.ast(),
            expression.ast(),
            statement1.ast(),
            block.ast()
        )
    },
    ReturnStatement(_return, expression){
        return new core.ReturnStatement(expression.ast())
    },
    EmptyReturnStatement(_return){
        return new core.ReturnStatement(new core.Token("DNE", "None"))
    },
    ListDec(prototype, id, assignment, _pipe0, list, _pipe1){
        return new core.ListDec(
            prototype.sourceString, 
            id.ast(),
            assignment.sourceString, 
            list.asIteration().ast()
        )
    },
    ListLit(_lp, prototype, _rp, _pipe0, list, _pipe1){
        return new core.ListExp(
            `||${prototype.sourceString}||`, 
            list.asIteration().ast()
        )
    },
    MapDec(prototype, id, assignment, _wall0, map, _wall1){
        return new core.MapDec(
            prototype.sourceString,
            id.ast(),
            assignment.sourceString,
            map.asIteration().ast()
        )
    },
    MapLit(_lp, prototype, _rp, _wall0, map, _wall1){
        return new core.MapExp(
            `<<${prototype.sourceString}>>`,
            map.asIteration().ast()
        )
    },
    KeyValuePair(key, _colon, value){
        return new core.KeyValuePair(
            key.ast(),
            value.ast()
        )
    },
    Block(_lb, statements, _rb, _n){
        return new core.Block(statements.ast())
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
    Exp7_Index(left, _lb, exp, _rb){
        return new core.IndexExpression(
            left.ast(),
            exp.ast()
        )
    },
    Exp7_Call(left, _lp, args, _rp){
        return new core.Call(
            left.ast(),
            args.asIteration().ast()
        )
    },
    Exp7_Method(left, _dot, id, _lp, args, _rp){
        return new core.MethodExpression(
            left.ast(),
            id.ast(),
            args.asIteration().ast()
        )
    },
    Exp7_Access(left, _dot, id){
        return new core.AccessExpression(
            left.ast(),
            id.ast()
        )
    },
    Exp8_Expression(_lp, exp, _rp){
        return exp.ast()
    },
    rational(_int0, _dot, _int1, _e, _sign, _pow){
        return new core.Token("RAT", this.source)
    },
    integer(_int){
        return new core.Token("INT", this.source)
    },
    boolean(_bool){
        return new core.Token("BOOL", this.source)
    },
    string(_lq, chars, _rq){
        return new core.Token("STR", this.source)
    },
    self(_self){
        return new core.Token("Self", this.source)
    },
    doesnotexist(_dne){
        return new core.Token("DNE", this.source)
    },
    id(_letter, _rest){
        return new core.Token("Id", this.source)
    },
    prototype_ListProto(_lp, _proto, _rp){
        return new core.Token(this.sourceString, this.source)
    },
    prototype_MapProto(_lw, _proto, _rw){
        return new core.Token(this.sourceString, this.source)
    },
    Pipelines(_pipeline, _lb, pipes, _rb){
        return new core.Pipelines(
            pipes.ast()
        )
    },
    Pipe_Newlines(_nl0, pipe, _nl1){
        return pipe.ast()
    },
    Pipe_Injection(args, op, end){
        return new core.Pipe(
            args.asIteration().ast(),
            op.sourceString,
            end.ast()
        )
    },
    Pipe_Drain(args, op, end){
        return new core.Pipe(
            args.asIteration().ast(),
            op.sourceString,
            end.ast()
        )
    },
    Pipe_Caster(args, op, end){
        return new core.Pipe(
            args.asIteration().ast(),
            op.sourceString,
            end.ast()
        )
    },
    Pipe_Factory(args, op, end){
        return new core.Pipe(
            args.asIteration().ast(),
            op.sourceString,
            end.ast()
        )
    },
    _terminal() {
        return new core.Token("Sym", this.source)
    },
    _iter(...children) {
        return children.map(child => child.ast())
    }
})

export default function ast(sourceCode) {
    const match = plumbGrammar.match(sourceCode)
    if (!match.succeeded()) {
      throw new Error(match.message)
    }
    return astBuilder(match).ast()
  }