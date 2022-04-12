import {
    VariableObj,
    PrototypeObj,
    FunctionObj,
    AttributeObj,
    MethodObj,
    ListPrototypeObj,
    MapPrototypeObj
} from "./core.js"
import * as stdlib from "./stdlib.js"

class Context {
    constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
      Object.assign(this, { parent, locals, inLoop, function: f })
    }
    sees(name) {
        // Search "outward" through enclosing scopes
        return this.locals.has(name) || this.parent?.sees(name)
    }
    add(name, entity){
        this.locals.set(name, entity)
    }
    lookup(name) {
        const entity = this.locals.get(name)
        if (entity) {
            return entity
        } else if (this.parent) {
            return this.parent.lookup(name)
        }
        error(`Identifier ${name} not declared`)
    }
    newChildContext(props) {
        return new Context({ ...this, ...props, parent: this, locals: new Map() })
    }
    analyze(node) {
        return this[node.constructor.name](node)
    }
    Program(p) {
        this.analyze(p.imports)
        this.analyze(p.definition)
        this.analyze(p.pipeline)
    }
    ImportDec(I) {
        this.add("Import Definition", I.path)
    }
    Definitions(D) {
        this.analyze(D.block)
    }
    VariableDec(V) {
        this.analyze(V.expression)
        V.id.value = new VariableObj(V.prototype, V.id)
        this.add(V.id.lexeme, V.id)
        //check if var is already declared
    }
    Assignment(A) {
        //add if that changes based on if self is there
        this.analyze(A.expression)
        this.analyze(A.id)
        //checkAssignable()
    }
    FunctionDec(F) {
        if (F.prototype) this.analyze(F.prototype)
        F.id.value = new FunctionObj(
            F.prototype, //check later for source of odd prototypes
            F.id,
            F.parameters
        )
        //check if function is already declared
        //checkisatype
        const childContext = this.newChildContext({ inLoop: false, function: F.id.value})
        childContext.analyze(F.id.value.parameters)
        this.add(F.id.lexeme, F.id.value)
        childContext.analyze(F.block)
    }
    PrototypeDec(P) {
        this.add(P.prototype.id, P.prototype)
        this.newChildContext().analyze(P.block)
        //check if prototype is already declared
    }
    AttributeDec(A) {
        this.analyze(A.expression)
        this.analyze(A.id)
        A.id.value = new AttributeObj(A.prototype, A.id)
        this.add(A.id.lexeme, A.id)
        //check if attribute is already declared
    }
    MethodDec(M) {
        if (M.prototype) this.analyze(M.prototype)
        M.id.value = new MethodObj(
            M.prototype, 
            M.id, 
            M.parameters
        )
        //check if method is already declared
        //checkisatype
        const childContext = this.newChildContext({ inLoop: false, method: M.id.value})
        childContext.analyze(M.id.value.parameters)
        this.add(M.id.lexeme, M.id.value)
        childContext.analyze(M.block)
    }
    IfStatement(I) {
        this.analyze(I.condition)
        //checkBool
        this.newChildContext().analyze(I.block)
    }
    WhileStatement(W) {
        this.analyze(W.condition)
        //checkBool
        this.newChildContext().analyze(W.block)
    }
    ForStatement(F) {
        this.analyze(F.condition)
        //checkBool
        const bodyContext = this.newChildContext({ inLoop: true })
        bodyContext.analyze(F.assignment)
        bodyContext.analyze(F.iteration)
        //checkisincrementation
        bodyContext.analyze(F.block)
    }
    ReturnStatement(R) {
        //checkinfunction
        //checkreturnssomething
        this.analyze(R.expression)
        //checkreturnable
    }
    ListDec(L) {

    }
    ListExp(L) {
        this.analyze(L.list)
        //checkallhavesametype
        L.prototype = new ListPrototypeObj(L.prototype)
    }
    MapDec(M) {

    }
    MapExp(M) {
        this.analyze(M.map)
        //checkifallhavesametype
        //checkallkeysarestrings
        M.prototype = new MapPrototypeObj(M.prototype)
    }
    KeyValuePair(K) {

    }
    Block(B) {
        this.analyze(B.statements)
    }
    BinaryExpression(B) {
        this.analyze(B.left)
        this.analyze(B.right)
        if(["or", "and"].includes(B.op.lexeme)){
            //checkBoolleft
            //checkBoolRight
            B.prototype = PrototypeObj.boolean
        } else if(["==", "!="].includes(B.op.lexeme)){
            //checksametype
            B.prototype = PrototypeObj.boolean
        } else if(["<=", ">=", "<", ">"].includes(B.op.lexeme)){
            //checknumberorstring
            B.prototype = PrototypeObj.boolean
        } else if(["+"].includes(B.op.lexeme)){
            //checknumberorstring
            //checkhavesametype
            B.prototype = B.left.prototype
        } else if(["-", "*", "/", "%", "^"].includes(B.op.lexeme)){
            //checkifnumber
            //checksametype
            B.prototype = B.left.prototype
        }
    }
    UnaryExpression(U) {
        this.analyze(U.operand)
        if("!" === U.op.lexeme){
            //checkBool
            U.prototype = PrototypeObj.boolean
        } else if ("-" === U.op.lexeme){
            //checknumeric
            U.prototype = U.operand.prototype
        }
    }
    IndexExpression(I) {
        this.analyze(I.object)
        this.analyze(I.index)
        I.prototype = I.object.prototype
        /*
        if(ismap) {
            //checkifindexisstring
        } else if (islist) {
            //checkifindexisint
        }
        */
    }
    Call(C) {
        //this.analyze(C)
    }
}


export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.contents)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
  }