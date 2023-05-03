import {
    Call,
    PipeDec,
    VariableObj,
    PrototypeObj,
    FunctionObj,
    TypeParameterPairObj,
    AttributeObj,
    MethodObj,
    PipeObj,
    ListPrototypeObj,
    MapPrototypeObj,
    Token,
    error,
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
    checkType(
        e,
        [PrototypeObj.integer, PrototypeObj.rational, PrototypeObj.string],
        "a number or a string"
    )
}

function checkIsBool(e) {
    checkType(e, [PrototypeObj.boolean], "a boolean")
}

function checkIsInt(e) {
    checkType(e, [PrototypeObj.integer], "a integer")
}

function checkIsString(e) {
    checkType(e, [PrototypeObj.string], "a integer")
}

function checkIsAType(e) {
    check(e instanceof PrototypeObj, "Type expected")
}

function checkIsSameType(t1, t2) {
    check(
        t1.prototype == t2.prototype ||
            t1.prototype == PrototypeObj.doesNotExist ||
            t2.prototype == PrototypeObj.doesNotExist,
        "Operands not of equivalent type"
    )
}

function checkIsAssignable(eType, cType) {
    check(
        eType === "DNE" || cType == "DNE" || eType == cType || cType == PrototypeObj.doesNotExist || eType == PrototypeObj.doesNotExist,
        `Cannot assign a ${eType} to a ${cType}`
    )
}

function checkIsCallable(e) {
    check(
        e instanceof PrototypeObj || e instanceof FunctionObj,
        "Call of a non-function or non-constructor",
        e
    )
}

function checkDeclaration(item, context) {
    let exists = false
    try {
        exists = context.lookup(item) === item
    } catch (e) {}
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

function checkElementsAllOfSameType(list, DNEPassThrough=false) {
    if (!DNEPassThrough) {
        check(
            list.slice(1).every((e) => e.prototype == list[0].prototype),
            "Elements in list not all of same type",
            list
        )
    } 
}

function checkKeyValuesAllOfSameType(map) {
    check(
        map.slice(1).every((e) => e.value.prototype == map[0].value.prototype),
        "Values in map not all of same type",
        map
    )
}

function checkIsReturnable(eType, cType) {
    checkIsAssignable(eType, cType)
}

function checkFunctionArguments(args, calleeType) {}

function checkMethodArguments(args, calleeType) {}

function checkConstructorArguments(args, objectType) {}

function checkIsIncrementStatement(s) {
    let increments = false
    increments = ["<++", "<--", "<**", "<//", "<%%"].includes(s?.assignment)
    check(increments, "Not an Incrementing assignment statement", s)
}

class Context {
    constructor({
        parent = null,
        locals = new Map(),
        inLoop = false,
        function: f = null,
        prototype: p = null,
        hasConstructor: c = false,
        prevPipe: pp = null,
    }) {
        Object.assign(this, {
            parent,
            locals,
            inLoop,
            function: f,
            prototype: p,
            hasConstructor: c,
            prevPipe: pp,
        })
    }
    sees(name) {
        // Search "outward" through enclosing scopes
        return this.locals.has(name) || this.parent?.sees(name)
    }
    add(name, entity) {
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
        return new Context({
            ...this,
            ...props,
            parent: this,
            locals: new Map(),
        })
    }
    analyze(node) {
        return this[node.constructor.name](node)
    }
    Program(P) {
        if (P.imports) this.analyze(P.imports)
        if (P.definition) this.analyze(P.definition)
        if (P.pipeline) this.analyze(P.pipeline)
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
        this.add(V.id.lexeme, V.id.value)
    }
    Assignment(A) {
        this.analyze(A.expression)
        this.analyze(A.id)
        checkIsAssignable()
    }
    FunctionDec(F) {
        if (!this.hasConstructor && this.prototype) {
            this.hasConstructor = true
            F.prototype = this.prototype
            let constructorFunction = new FunctionObj(
                F.prototype,
                F.id,
                F.parameters
            )
            this.prototype.constructorFunc = F
            F.id.value = constructorFunction
            checkIsAType(F.prototype)
            const childContext = this.newChildContext({
                inLoop: false,
                function: F.id.value,
            })
            childContext.analyze(F.parameters)
            this.add(F.id.lexeme, F.id.value)
            childContext.analyze(F.block)
        } else {
            F.prototype = [
                PrototypeObj.integer,
                PrototypeObj.string,
                PrototypeObj.boolean,
                PrototypeObj.doesNotExist,
                PrototypeObj.rational,
            ].filter((type) => type.id == F.prototype)[0]
            F.id.value = new FunctionObj(
                F.prototype,
                F.id,
                F.parameters
            )
            checkFunctionDeclaration(F.id.lexeme, this)
            checkIsAType(F.prototype)
            const childContext = this.newChildContext({
                inLoop: false,
                function: F.id.value,
            })
            childContext.analyze(F.parameters)
            this.add(F.id.lexeme, F.id.value)
            childContext.analyze(F.block)
        }
    }
    TypeParameterPairDec(P) {
        P.prototype = [
            PrototypeObj.integer,
            PrototypeObj.string,
            PrototypeObj.boolean,
            PrototypeObj.doesNotExist,
            PrototypeObj.rational,
        ].filter((type) => type.id == P.prototype)[0]
        P.id.value = new TypeParameterPairObj(P.prototype, P.id)
        this.add(P.id.lexeme, P.id.value)
    }
    PrototypeDec(P) {
        checkPrototypeDeclaration(P.id.lexeme, this)
        P.id.value = new PrototypeObj(P.id.lexeme)
        let childContext = this.newChildContext({
            inLoop: false,
            prototype: P.id.value,
            hasConstructor: false,
        })
        this.add(P.id.lexeme, P.id.value)
        childContext.analyze(P.block)
    }
    AttributeDec(A) {
        this.analyze(A.expression)
        checkAttributeDeclaration(A.id.lexeme, this)
        A.id.value = new AttributeObj(A.prototype, A.id)
        this.add(A.id.lexeme, A.id)
        this.prototype.attributes.push(A)
    }
    MethodDec(M) {
        M.prototype = [
            PrototypeObj.integer,
            PrototypeObj.string,
            PrototypeObj.boolean,
            PrototypeObj.doesNotExist,
            PrototypeObj.rational,
        ].filter((type) => type.id == M.prototype)[0]
        M.id.value = new MethodObj(M.prototype, M.id, M.parameters)
        checkMethodDeclaration(M.id.lexeme, this)
        checkIsAType(M.prototype)
        const childContext = this.newChildContext({
            inLoop: false,
            function: M.id.value,
        })
        childContext.analyze(M.id.value.parameters)
        this.add(M.id.lexeme, M.id)
        childContext.analyze(M.block)
        this.prototype.methods.push(M)
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
        const bodyContext = this.newChildContext({ inLoop: true })
        bodyContext.analyze(F.assignment)
        bodyContext.analyze(F.condition)
        checkIsBool(F.condition)
        bodyContext.analyze(F.iteration)
        checkIsIncrementStatement(F.iteration)
        bodyContext.analyze(F.block)
    }
    ReturnStatement(R) {
        checkInFunction(this)
        this.analyze(R.expression)
        R.prototype = R.expression.prototype
        checkIsReturnable(R.prototype?.id ?? R.prototype, this.function.prototype.id)
    }
    ListDec(L) {
        checkVarDeclaration(L.id.lexeme, this)
        L.id.value = new VariableObj(L.prototype, L.id)
        this.add(L.id.lexeme, L.id.value)
        this.analyze(L.list)
        if(L.prototype == "||DNE||") checkElementsAllOfSameType(L.list, true)
        else checkElementsAllOfSameType(L.list)
        L.prototype = new ListPrototypeObj(L.prototype)
        checkIsSameType(
            L.prototype.basePrototype,
            L.list[0]?.prototype.id ?? PrototypeObj.doesNotExist.id
        )
    }
    ListExp(L) {
        this.analyze(L.list)
        checkElementsAllOfSameType(L.list)
        L.prototype = new ListPrototypeObj(L.prototype)
    }
    MapDec(M) {
        checkVarDeclaration(M.id.lexeme, this)
        M.id.value = new VariableObj(M.prototype, M.id)
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
        if (["or", "and"].includes(B.op)) {
            checkIsBool(B.left)
            checkIsBool(B.right)
            B.prototype = PrototypeObj.boolean
        } else if (["==", "!="].includes(B.op)) {
            checkIsSameType(B.left, B.right)
            B.prototype = PrototypeObj.boolean
        } else if (["<=", ">=", "<", ">"].includes(B.op)) {
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            B.prototype = PrototypeObj.boolean
        } else if (["+"].includes(B.op)) {
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            B.prototype = B.left.prototype
        } else if (["-", "*", "/", "%", "^"].includes(B.op)) {
            checkIsNumber(B.left)
            checkIsSameType(B.left, B.right)
            B.prototype = B.left.prototype
        }
    }
    UnaryExpression(U) {
        this.analyze(U.operand)
        if ("!" === U.op.lexeme) {
            checkIsBool(U.operand)
            U.prototype = PrototypeObj.boolean
        } else if ("-" === U.op.lexeme) {
            checkIsNumber(U.operand)
            U.prototype = U.operand.prototype
        }
    }
    IndexExpression(I) {
        this.analyze(I.object)
        this.analyze(I.index)
        I.prototype = I.object.prototype
        if (I.object.constructor === MapPrototypeObj) {
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
        if (callee.constructor === PrototypeObj) {
            checkConstructorArguments(C.args, this.lookup(C.id.lexeme))
            C.prototype = callee.prototype
        } else {
            checkFunctionArguments(C.args, this.lookup(C.id.lexeme))
            C.prototype = callee.prototype
        }
    }
    AccessExpression(A) {
        this.analyze(A.object)
        checkAttributeDeclaration(A.attribute.lexeme, this)
        if (!(A.object.prototype instanceof PrototypeObj)) {
            A.object.prototype = this.lookup(A.object.prototype)
        }
        A.attribute = A.object.prototype.attributes.find(
            (a) => a.id.lexeme === A.attribute.lexeme
        )
        A.prototype = A.attribute.prototype
    }
    MethodExpression(M) {
        this.analyze(M.object)
        checkMethodDeclaration(M.method.lexeme, this)
        this.analyze(M.args)
        checkMethodArguments(M.args, this.lookup(M.method.lexeme))
        M.method = this.lookup(M.method.lexeme)
        M.prototype = M.method.prototype
    }
    Pipelines(P) {
        let pipelineContext = this.newChildContext()
        pipelineContext.analyze(P.pipes)
    }
    PipeDec(P) {
        let toApply = null
        let toApplyString = ""
        if (this.prevPipe && this.prevPipe.nextPipe.constructor == PipeDec) {
            toApplyString = P.inputs
            toApply = P.inputs
            P.inputs = this.prevPipe.value.outputs
        }
        if (toApply) this.analyze(toApply)
        this.analyze(P.inputs)
        if (/^-->$/.test(P.op)) {
            if (toApply)
                P.value = new PipeObj(
                    P.inputs,
                    P.op,
                    new Call(toApply, P.inputs),
                    P.nextPipe,
                    this.prevPipe
                )
            else
                P.value = new PipeObj(
                    P.inputs,
                    P.op,
                    P.inputs,
                    P.nextPipe,
                    this.prevPipe
                )
            //leave late for ast
            if (toApplyString != "") P.inputs = toApplyString
        } else if (/^-((.)-)+>$/.test(P.op)) {
            let regResult = /^-((?:.-)+)>$/.exec(P.op)
            let attributesDrained = regResult[1]
                .substring(0, regResult[1].length - 1)
                .split("-")
                .map((attribute) => this.lookup(attribute))
            P.value = new PipeObj(
                P.inputs,
                P.op,
                attributesDrained,
                P.nextPipe,
                this.prevPipe
            )
        } else if (P.op == "--<(") {
            let toBePiped = P.inputs?.list ?? P.inputs
            P.value = toBePiped.map(
                (item) =>
                    new PipeObj(item, "-->", item, P.nextPipe, this.prevPipe)
            )
        } else if (/^-\(.+?\)->$/.test(P.op)) {
            regResult = /^-\((.+?)\)->$/.exec(P.op)[1]
            let prototypeToCast = this.lookup(regResult)
            P.value = new PipeObj()
        }
        this.prevPipe = P
        this.analyze(P.nextPipe)
    }
    Token(T) {
        if (T.category === "Id") {
            T.value = this.lookup(T.lexeme)
            if (
                ["INT", "RAT", "STR", "DNE", "BOOL"].includes(T.value.prototype)
            ) {
                T.prototype = [
                    PrototypeObj.integer,
                    PrototypeObj.string,
                    PrototypeObj.boolean,
                    PrototypeObj.doesNotExist,
                    PrototypeObj.rational,
                ].filter((type) => type.id == T.value.prototype)[0]
            } else {
                T.prototype = T.value.prototype
            }
        }
        if (T.category === "INT")
            [T.value, T.prototype] = [BigInt(T.lexeme), PrototypeObj.integer]
        if (T.category === "RAT")
            [T.value, T.prototype] = [Number(T.lexeme), PrototypeObj.rational]
        if (T.category === "STR")
            [T.value, T.prototype] = [T.lexeme, PrototypeObj.string]
        if (T.category === "DNE")
            [T.value, T.prototype] = [T.lexeme == "none" ? null: T.lexeme == "all" ? null : T.lexeme, PrototypeObj.doesNotExist]
        if (T.category === "BOOL")
            [T.value, T.prototype] = [T.lexeme === "true", PrototypeObj.boolean]
        if (T.category.toLowerCase() === "self") 
            [T.value, T.prototype] = [this.prototype, this.prototype]
    }
    Array(a) {
        a.forEach((item) => this.analyze(item))
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
