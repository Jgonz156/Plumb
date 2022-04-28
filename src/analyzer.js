//import { prototype } from "mocha"
import {
    VariableObj,
    PrototypeObj,
    FunctionObj,
    TypeParameterPairObj,
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
    check(types.includes(e.prototype), `Expected ${expectation}`)
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
    check((e instanceof PrototypeObj), "Type expected")
}

function checkIsSameType(t1, t2) {
    check(t1.prototype == t2.prototype || t1.prototype == PrototypeObj.doesNotExist || t2.prototype == PrototypeObj.doesNotExist, "Operands not of equivalent type")
}

function checkIsAssignable(eType, cType) {
    check(
        eType === "DNE" || eType==cType,
        `Cannot assign a ${eType} to a ${cType}`
    )
}

function checkIsCallable(e) {
    check(
        (e instanceof PrototypeObj || e instanceof FunctionObj),
        "Call of a non-function or non-constructor",
        e
    )
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

function checkElementsAllOfSameType(list) {
    check(
        list.slice(1).every(e => e.prototype == list[0].prototype),
        "Elements in list not all of same type", 
        list
    )
}

function checkKeyValuesAllOfSameType(map) {
    check(
        map.slice(1).every(e => e.value.prototype == map[0].value.prototype),
        "Values in map not all of same type",
        map
    )
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
function checkIsReturnable(eType, cType) {
    checkIsAssignable(eType, cType)
}
/*
function checkSomethingToReturn(f) {

}
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
    constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null, prototype: p = null, hasConstructor: c = false, prevPipe: pp = null }) {
      Object.assign(this, { parent, locals, inLoop, function: f, prototype: p, hasConstructor: c, prevPipe: pp })
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
        //console.log(V)
        this.analyze(V.expression)
        checkVarDeclaration(V.id.lexeme, this)
        V.id.value = new VariableObj(V.prototype, V.id)
        this.add(V.id.lexeme, V.id.value)
    }
    Assignment(A) {
        //add if that changes based on if self is there
        this.analyze(A.expression)
        this.analyze(A.id)
        checkIsAssignable()
    }
    FunctionDec(F) {
        if(!this.hasConstructor && this.prototype){
            this.hasConstructor = true
            //console.log(this)
            F.prototype = this.prototype
            let constructorFunction = new FunctionObj(
                F.prototype, //check later for source of odd prototypes
                F.id,
                F.parameters
            )
            this.prototype.constructorFunc = constructorFunction
            F.id.value = constructorFunction
            //console.log(F)
            checkIsAType(F.prototype)
            const childContext = this.newChildContext({ inLoop: false, function: F.id.value })
            childContext.analyze(F.parameters)
            this.add(F.id.lexeme, F.id.value)
            childContext.analyze(F.block)
        } else {
            //console.log(F)
            F.prototype = [PrototypeObj.integer, PrototypeObj.string, PrototypeObj.boolean, PrototypeObj.doesNotExist, PrototypeObj.rational].filter( type => type.id == F.prototype )[0]
            //console.log(F)
            F.id.value = new FunctionObj(
                F.prototype, //check later for source of odd prototypes
                F.id,
                F.parameters
            )
            checkFunctionDeclaration(F.id.lexeme, this)
            checkIsAType(F.prototype)
            const childContext = this.newChildContext({ inLoop: false, function: F.id.value })
            childContext.analyze(F.parameters)
            this.add(F.id.lexeme, F.id.value)
            childContext.analyze(F.block)
        }
    }
    TypeParameterPairDec(P) {
        //console.log(P)
        P.prototype = [PrototypeObj.integer, PrototypeObj.string, PrototypeObj.boolean, PrototypeObj.doesNotExist, PrototypeObj.rational].filter( type => type.id == P.prototype )[0]
        //P.id = new VariableObj(P.prototype, P.id)
        P.id.value = new TypeParameterPairObj(P.prototype, P.id)
        //console.log(P)
        this.add(P.id.lexeme, P.id.value)
    }
    PrototypeDec(P) {
        checkPrototypeDeclaration(P.id.lexeme, this)
        P.id.value = new PrototypeObj(P.id.lexeme)
        let childContext = this.newChildContext({ inLoop: false, prototype: P.id.value, hasConstructor: false })
        this.add(P.id.lexeme, P.id.value)
        //console.log("After adding the new prototype",this)
        childContext.analyze(P.block)
    }
    AttributeDec(A) {
        this.analyze(A.expression)
        checkAttributeDeclaration(A.id.lexeme, this)
        A.id.value = new AttributeObj(A.prototype, A.id)
        this.add(A.id.lexeme, A.id)
        this.prototype.attributes.push(A.id.value)
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
        const childContext = this.newChildContext({ inLoop: false, function: M.id.value })
        childContext.analyze(M.id.value.parameters)
        this.add(M.id.lexeme, M.id.value)
        childContext.analyze(M.block)
    }
    IfStatement(I) {
        this.analyze(I.condition)
        //console.log(I)
        checkIsBool(I.condition)
        this.newChildContext().analyze(I.block)
    }
    WhileStatement(W) {
        this.analyze(W.condition)
        checkIsBool(W.condition)
        this.newChildContext({ inLoop: true }).analyze(W.block)
    }
    ForStatement(F) {
        const bodyContext = this.newChildContext({ inLoop: true })
        bodyContext.analyze(F.assignment)
        bodyContext.analyze(F.condition)
        //console.log(F)
        //console.log(F.condition)
        //console.log(F.condition.prototype)
        checkIsBool(F.condition)
        bodyContext.analyze(F.iteration)
        checkIsIncrementStatement(F.iteration)
        bodyContext.analyze(F.block)
    }
    ReturnStatement(R) {
        checkInFunction(this)
        //checkSomethingToReturn(R.expression)
        this.analyze(R.expression)
        //console.log(R, this)
        R.prototype = R.expression.prototype
        checkIsReturnable(R.prototype.id, this.function.prototype.id)
    }
    ListDec(L) {
        checkVarDeclaration(L.id.lexeme, this)
        L.id.value = new VariableObj(L.prototype, L.id.lexeme)
        this.add(L.id.lexeme, L.id.value)
        //console.log("Before: ", L.list)
        this.analyze(L.list)
        //console.log("After: ", L.list)
        checkElementsAllOfSameType(L.list)
        L.prototype = new ListPrototypeObj(L.prototype)
        checkIsSameType(L.prototype.basePrototype, L.list[0]?.prototype.id ?? PrototypeObj.doesNotExist.id)
    }
    ListExp(L) {
        this.analyze(L.list)
        checkElementsAllOfSameType(L.list)
        L.prototype = new ListPrototypeObj(L.prototype)
    }
    MapDec(M) {
        checkVarDeclaration(M.id.lexeme, this)
        M.id.value = new VariableObj(M.prototype, M.id.lexeme)
        this.add(M.id.lexeme, M.id.value)
        this.analyze(M.map)
        checkKeyValuesAllOfSameType(M.map)
        M.prototype = new MapPrototypeObj(M.prototype)
    }
    MapExp(M) {
        this.analyze(M.map)
        checkKeyValuesAllOfSameType(M.map)
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
        if(["or", "and"].includes(B.op)){
            checkIsBool(B.left)
            checkIsBool(B.right)
            B.prototype = PrototypeObj.boolean
        } else if(["==", "!="].includes(B.op)){
            checkIsSameType(B.left, B.right)
            B.prototype = PrototypeObj.boolean
        } else if(["<=", ">=", "<", ">"].includes(B.op)){
            //console.log(B)
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            //checknumberorstring
            B.prototype = PrototypeObj.boolean
        } else if(["+"].includes(B.op)){
            //console.log(B)
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            //checknumberorstring
            B.prototype = B.left.prototype
        } else if(["-", "*", "/", "%", "^"].includes(B.op)){
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
        //console.log(C)
        const callee = C.id?.value ?? C.id
        //console.log(this)
        //console.log("callee", callee)
        checkIsCallable(callee)
        this.analyze(C.args)
        if(callee.constructor === PrototypeObj){
            checkConstructorArguments(C.args, this.lookup(C.id.lexeme))//sacoajvioac
            C.prototype = callee.prototype
        } else {
            checkFunctionArguments(C.args, this.lookup(C.id.lexeme))//coajicofacda
            C.prototype = callee.prototype
        }
    }
    AccessExpression(A) {
        this.analyze(A.object)
        checkAttributeDeclaration(A.attribute.lexeme, this)
        if (!(A.object.prototype instanceof PrototypeObj)) {
            A.object.prototype = this.lookup(A.object.prototype)
        }
        A.attribute = A.object.prototype.attributes.find(a => a.id.lexeme === A.attribute.lexeme)
        A.prototype = A.attribute.prototype
    }
    MethodExpression(M) {
        this.analyze(M.object)
        checkMethodDeclaration(M.method.lexeme, this)
        this.analyze(M.args)
        //console.log(M)
        checkMethodArguments(M.args, this.lookup(M.method.lexeme))
        M.method = this.lookup(M.method.lexeme)
        M.prototype = M.method.prototype
    }
    Pipelines(P) {
        let pipelineContext = this.newChildContext()
        this.analyze(P.pipes)
    }
    Pipe(P) {
        this.analyze(P.inputs)
        if(/^-->$/.test(P.op)){
            P.outputs = P.inputs
        } else if(/^-((.)-)+>$/.test(P.op)){
            regResult = /^-((?:.-)+)>$/.exec(P.op)
            P.attributesToDrain = regResult[1].substring(0, regResult[1].length-1).split("-").map(attribute => this.lookup(attribute))
        }
        this.analyze(P.nextPipe)
    }
    Token(T) {
        if(T.category === "Id") {
            T.value = this.lookup(T.lexeme)
            if(["INT", "RAT", "STR", "DNE", "BOOL"].includes(T.value.prototype)){
                //console.log("TokenContextWhenAssigningPrototype",this)
                T.prototype = [PrototypeObj.integer, PrototypeObj.string, PrototypeObj.boolean, PrototypeObj.doesNotExist, PrototypeObj.rational].filter( type => type.id == T.value.prototype )[0]
            } else {
                T.prototype = T.value.prototype
            }
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