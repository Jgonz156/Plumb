import {
    VariableObj,
    PrototypeObj,
    FunctionObj,
    AttributeObj,
    MethodObj,
    ListPrototypeObj,
    MapPrototypeObj,
    Token,
    error
} from "./core.js"
import * as stdlib from "./stdlib.js"

function check(condition, message, entity) {
    if (!condition) error(message, entity)
}

function checkType(e, types, expectation) {
    check(types.includes(e.type), `Expected ${expectation}`)
}

function checkIsNumber(e) {
    checkType(e, [PrototypeObj.integer, PrototypeObj.rational], "a number")
}

function checkIsNumberOrString(e) {
    checkType(e, [PrototypeObj.integer, PrototypeObj.rational, PrototypeObj.string], "a number or a string")
}

function checkIsBool(e) {
    checkType(e, [PrototypeObj.boolean], "a boolean")
}

function checkIsInt(e) {
    checkType(e, [PrototypeObj.integer], "a integer")
}

function checkIsAType(e) {
    check(e instanceof PrototypeObj, "Type expected", e)
}

function checkIsSameType(e1, e2) {
    check(e1.prototype.isEquivalentTo(e2.prototype), "Operands not of equivalent type", [e1, e2])
}

function checkElementsAllOfSameType(exps) {
    check(exps.slice(0).every(e => e.prototype.isEquivalentTo(exps[0].prototype)), "Not all elements have the same type", exps)
}

function checkIsAssignable(e, { toType: type }) {
    check(
        type === PrototypeObj.doesNotExist || e.type.isAssignableTo(type),
        `Cannot assign a ${e.type} to a ${type}`,
        e
    )
}

function checkIsCallable(e) {
    check(
        e.constructor === PrototypeObj || e.prototype.constructor === FunctionObj,
        "Call of a non-function or non-constructor",
        e
    )
}

function checkNothingToReturn() {

}

function checkSomethingToReturn() {

}

function checkDeclaration(item, context){
    let exists = false
    try{
        exists = context.lookup(item) === item
    } catch(e){

    }
    check(!exists, `${item} already declared in given context`, item)
}

function checkVarDeclaration(v, context) {
    checkDeclaration(v, context)
}

function checkFunctionDeclaration(f, context) {
    checkDeclaration(f, context)
}

function checkMethodDeclaration(m, context) {
    checkDeclaration(m, context)
}

function checkAttributeDeclaration(a, context) {
    checkDeclaration(a, context)
}

function checkPrototypeDeclaration(p, context) {
    checkDeclaration(p, context)
}

function checkInFunction(context) {
    check(context.function, "Return can only appear in a function")
}
/*
function checkArgumentsMatch(args, targetTypes) {
    check(
      targetTypes.length === args.length,
      `${targetTypes.length} argument(s) required but ${args.length} passed`
    )
    targetTypes.forEach((type, i) => checkAssignable(args[i], { toType: type }))
  }
  
  function checkFunctionCallArguments(args, calleeType) {
    checkArgumentsMatch(args, calleeType.paramTypes)
  }
  
  function checkConstructorArguments(args, structType) {
    const fieldTypes = structType.fields.map(f => f.type)
    ch
*/
function checkFunctionArguments(args, calleeType) {

}

function checkMethodArguments(args, calleeType) {

}

function checkConstructorArguments(args, objectType) {

}

function checkIsIncrementStatement(s) {
    let increments = false
    increments = ["<++", "<--", "<**", "<//", "<%%"].includes(s?.assignment)
    check(!increments, "Not an Incrementing assignment statement", s) //check later for true false thing being wrong (!increments)
}

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
    Program(P) {
        if(P.imports) this.analyze(P.imports)
        if(P.definition) this.analyze(P.definition)
        if(P.pipeline) this.analyze(P.pipeline)
    }
    ImportDec(I) {
        this.add("Import Definition", I.path)
    }
    Definitions(D) {
        this.analyze(D.block)
    }
    VariableDec(V) {
        this.analyze(V.expression)
        checkVarDeclaration(V.id.lexeme, this)
        V.id.value = new VariableObj(V.prototype, V.id)
        this.add(V.id.lexeme, V.id)
    }
    Assignment(A) {
        //add if that changes based on if self is there
        this.analyze(A.expression)
        this.analyze(A.id)
        checkIsAssignable()
    }
    FunctionDec(F) {
        if (F.prototype) this.analyze(F.prototype)
        F.id.value = new FunctionObj(
            F.prototype, //check later for source of odd prototypes
            F.id,
            F.parameters
        )
        checkFunctionDeclaration(F.id.lexeme, this)
        checkIsAType(F.prototype)
        const childContext = this.newChildContext({ inLoop: false, function: F.id.value })
        childContext.analyze(F.id.value.parameters)
        this.add(F.id.lexeme, F.id.value)
        childContext.analyze(F.block)
    }
    PrototypeDec(P) {
        checkPrototypeDeclaration(P.id.lexeme, this)
        P.id.value = new PrototypeObj(P.id.lexeme)
        let childContext = this.newChildContext({ inLoop: false, prototype: P.id.value })
        this.add(P.id.lexeme, P.id)
        childContext.analyze(P.block)
    }
    AttributeDec(A) {
        this.analyze(A.expression)
        this.analyze(A.id)
        checkAttributeDeclaration(A.id.lexeme, this)
        A.id.value = new AttributeObj(A.prototype, A.id)
        this.add(A.id.lexeme, A.id)
    }
    MethodDec(M) {
        if (M.prototype) this.analyze(M.prototype)
        M.id.value = new MethodObj(
            M.prototype, 
            M.id, 
            M.parameters
        )
        checkMethodDeclaration(M.id.lexeme, this)
        checkIsAType(M.prototype)
        const childContext = this.newChildContext({ inLoop: false, method: M.id.value })
        childContext.analyze(M.id.value.parameters)
        this.add(M.id.lexeme, M.id.value)
        childContext.analyze(M.block)
    }
    IfStatement(I) {
        this.analyze(I.condition)
        checkIsBool(I.condition)
        this.newChildContext().analyze(I.block)
    }
    WhileStatement(W) {
        this.analyze(W.condition)
        checkIsBool(W.condition)
        this.newChildContext({ inLoop: true }).analyze(W.block)
    }
    ForStatement(F) {
        this.analyze(F.condition)
        checkIsBool(F.condition)
        const bodyContext = this.newChildContext({ inLoop: true })
        bodyContext.analyze(F.assignment)
        bodyContext.analyze(F.iteration)
        checkIsIncrementStatement(F.iteration)
        bodyContext.analyze(F.block)
    }
    ReturnStatement(R) {
        checkInFunction(this)
        checkSomethingToReturn(R.expression)
        this.analyze(R.expression)
        checkIsReturnable()//caicneiqc
    }
    ListDec(L) {
        this.analyze(L.id)
        checkVarDeclaration(L.id.lexeme, this)
        this.analyze(L.assignment)
        this.analyze(L.list)
        checkElementsAllOfSameType()//cjkwneviac
        //checkIsSameType()
        L.prototype = new ListPrototypeObj(L.prototype)
        L.id.value = new VariableObj(L.prototype, L.id.lexeme)
        this.add(L.id.lexeme, L.id.value)
    }
    ListExp(L) {
        this.analyze(L.list)
        checkElementsAllOfSameType()//cwinscjakca
        L.prototype = new ListPrototypeObj(L.prototype)
    }
    MapDec(M) {
        this.analyze(M.id)
        checkVarDeclaration(M.id.lexeme, this)
        this.analyze(M.map)
        checkElementsAllOfSameType()//ciacnjjwioa
        checkAllKeysAreStrings()//cjihacieoadcdn
        M.prototype = new MapPrototypeObj(M.prototype)
        M.id.value = new VariableObj(M.prototype, M.id.lexeme)
        this.add(M.id.lexeme, M.id.value)
    }
    MapExp(M) {
        this.analyze(M.map)
        checkElementsAllOfSameType()//cidhacssc
        checkAllKeysAreStrings()//eajfioscna
        M.prototype = new MapPrototypeObj(M.prototype)
    }
    KeyValuePair(K) {
        this.analyze(K.key)
        checkIsString(K.key)
        this.analyze(K.value)
    }
    Block(B) {
        this.analyze(B.statements)
    }
    BinaryExpression(B) {
        this.analyze(B.left)
        this.analyze(B.right)
        if(["or", "and"].includes(B.op.lexeme)){
            checkIsBool(B.left)
            checkIsBool(B.right)
            B.prototype = PrototypeObj.boolean
        } else if(["==", "!="].includes(B.op.lexeme)){
            checkIsSameType(B.left, B.right)
            B.prototype = PrototypeObj.boolean
        } else if(["<=", ">=", "<", ">"].includes(B.op.lexeme)){
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            //checknumberorstring
            B.prototype = PrototypeObj.boolean
        } else if(["+"].includes(B.op.lexeme)){
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            //checknumberorstring
            B.prototype = B.left.prototype
        } else if(["-", "*", "/", "%", "^"].includes(B.op.lexeme)){
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            B.prototype = B.left.prototype
        }
    }
    UnaryExpression(U) {
        this.analyze(U.operand)
        if("!" === U.op.lexeme){
            checkIsBool(U.operand)
            U.prototype = PrototypeObj.boolean
        } else if ("-" === U.op.lexeme){
            checkIsNumber(U.operand)
            U.prototype = U.operand.prototype
        }
    }
    IndexExpression(I) {
        this.analyze(I.object)
        this.analyze(I.index)
        I.prototype = I.object.prototype
        if(I.object.constructor === MapPrototypeObj) { // CHECK LATER MIGHT CAUSE PROBS
            checkIsString(I.index)
        } else if (I.object.constructor === ListPrototypeObj) {
            checkIsInt(I.index)
        }
    }
    Call(C) {
        this.analyze(C.id)
        const callee = C.id?.value ?? C.id
        checkIsCallable(callee)
        this.analyze(C.args)
        if(callee.constructor === PrototypeObj){
            checkConstructorArguments(C.args, this.lookup(C.id.lexeme))//sacoajvioac
            C.prototype = callee
        } else {
            checkFunctionArguments(C.args, this.lookup(C.id.lexeme))//coajicofacda
            C.prototype = callee
        }
    }
    AccessExpression(A) {
        this.analyze(A.object)
        checkAttributeDeclaration(A.attribute.lexeme, this)
        A.attribute = A.object.attributes.find(a => a.id.lexeme === A.attribute.lexeme)
        A.prototype = A.attribute.prototype
    }
    MethodExpression(M) {
        this.analyze(M.object)
        checkMethodDeclaration(M.method.lexeme, this)
        this.analyze(M.args)
        checkMethodArguments(M.args, this.lookup(M.method.lexeme))// idoahcoacda
        M.method = M.object.methods.find(m => m.id.lexeme === M.method.lexeme)
        M.prototype = M.method.prototype
    }
    Pipelines(P) {
        throw new Error("Not yet pls")
    }
    Pipe(P) {
        throw new Error("Not yet pls")
    }
    Token(T) {
        if(T.category === "Id"){
            T.value = this.lookup(T.lexeme)
            T.prototype = T.value.prototype
        }
        if(T.category === "INT") [T.value, T.prototype] = [BigInt(T.lexeme), PrototypeObj.integer]
        if(T.category === "RAT") [T.value, T.prototype] = [Number(T.lexeme), PrototypeObj.rational]
        if(T.category === "STR") [T.value, T.prototype] = [T.lexeme, PrototypeObj.string]
        if(T.category === "DNE") [T.value, T.prototype] = [T.lexeme, PrototypeObj.doesNotExist]
        if(T.category === "BOOL") [T.value, T.prototype] = [T.lexeme === "true", PrototypeObj.boolean]
    }
    Array(a) {
        a.forEach(item => this.analyze(item))
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