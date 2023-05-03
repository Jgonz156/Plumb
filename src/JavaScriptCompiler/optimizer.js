import * as core from "./core.js"

export default function optimize(node) {
    return optimizers[node.constructor.name](node)
}

const optimizers = {
    Program(P) {
        if (P.imports) P.imports = optimize(P.imports)
        if (P.definition) P.definition = optimize(P.definition)
        if (P.pipeline) P.pipeline = optimize(P.pipeline)
        return P
    },
    ImportDec(I) {
        return I
    },
    Definitions(D) {
        D.block = optimize(D.block)
        return D
    },
    VariableDec(V) {
        V.id = optimize(V.id)
        V.expression = optimize(V.expression)
        return V
    },
    VariableObj(V) {
        return V
    },
    Assignment(A) {
        A.id = optimize(A.id)
        A.expression = optimize(A.expression)
        if (A.id == A.expression) {
            return []
        }
        return A
    },
    FunctionDec(F) {
        F.id = optimize(F.id)
        F.parameters = optimize(F.parameters)
        F.block = optimize(F.block)
        return F
    },
    FunctionObj(F) {
        return F
    },
    TypeParameterPairDec(T) {
        T.id = optimize(T.id)
        return T
    },
    TypeParameterPairObj(T) {
        return T
    },
    PrototypeDec(P) {
        P.id = optimize(P.id)
        P.block = optimize(P.block)
        return P
    },
    PrototypeObj(P) {
        return P
    },
    BigInt(e) {
        return e
    },
    Number(e) {
        return e
    },
    Boolean(e) {
        return e
    },
    String(e) {
        return e
    },
    AttributeDec(A) {
        A.id = optimize(A.id)
        A.expression = optimize(A.expression)
        return A
    },
    AttributeObj(A) {
        return A
    },
    MethodDec(M) {
        M.id = optimize(M.id)
        M.parameters = optimize(M.parameters)
        M.block = optimize(M.block)
        return M
    },
    IfStatement(I) {
        I.condition = optimize(I.condition)
        I.block = optimize(I.block)
        if (I.condition == false) {
            return []
        } else if (I.condition == true) {
            return I.block
        }
        return I
    },
    WhileStatement(W) {
        W.condition = optimize(W.condition)
        W.block = optimize(W.block)
        if (W.condition == false) {
            return []
        }
        return W
    },
    ForStatement(F) {
        F.assignment = optimize(F.assignment)
        F.condition = optimize(F.condition)
        F.iteration = optimize(F.iteration)
        F.block = optimize(F.block)
        if (F.condition == false) {
            return []
        }
        return F
    },
    ReturnStatement(R) {
        R.expression = optimize(R.expression)
        return R
    },
    ListDec(L) {
        L.id = optimize(L.id)
        L.list = optimize(L.list)
        return L
    },
    ListExp(L) {
        L.list = optimize(L.list)
        return L
    },
    MapDec(M) {
        M.id = optimize(M.id)
        M.map = optimize(M.map)
        return M
    },
    MapExp(M) {
        M.map = optimize(M.map)
        return M
    },
    KeyValuePair(K) {
        K.key = optimize(K.key)
        K.value = optimize(K.value)
        return K
    },
    Block(B) {
        B.statements = optimize(B.statements)
        return B
    },
    BinaryExpression(e) {
        e.left = optimize(e.left)
        e.op = optimize(e.op)
        e.right = optimize(e.right)
        if (e.op === "and") {
            if (e.left === true) return e.right
            else if (e.right === true) return e.left
        } else if (e.op === "or") {
            if (e.left === false) return e.right
            else if (e.right === false) return e.left
        } else if ([Number, BigInt].includes(e.left.constructor)) {
            if ([Number, BigInt].includes(e.right.constructor)) {
                if (e.op === "+") return e.left + e.right
                else if (e.op === "-") return e.left - e.right
                else if (e.op === "*") return e.left * e.right
                else if (e.op === "/") return e.left / e.right
                else if (e.op === "^") return e.left ** e.right
                else if (e.op === "<") return e.left < e.right
                else if (e.op === "<=") return e.left <= e.right
                else if (e.op === "==") return e.left === e.right
                else if (e.op === "!=") return e.left !== e.right
                else if (e.op === ">=") return e.left >= e.right
                else if (e.op === ">") return e.left > e.right
            } else if (e.left === 0 && e.op === "+") return e.right
            else if (e.left === 1 && e.op === "*") return e.right
            else if (e.left === 0 && e.op === "-")
                return new core.UnaryExpression("-", e.right)
            else if (e.left === 1 && e.op === "^") return 1
            else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
        } else if (e.right.constructor === Number) {
            if (["+", "-"].includes(e.op) && e.right === 0) return e.left
            else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
            else if (e.op === "*" && e.right === 0) return 0
            else if (e.op === "^" && e.right === 0) return 1
        }
        return e
    },
    UnaryExpression(e) {
        e.right = optimize(e.right)
        if (e.right.constructor == Number) {
            if (e.op == "-") {
                return -e.right
            }
        }
        return e
    },
    IndexExpression(I) {
        I.object = optimize(I.object)
        I.index = optimize(I.index)
        return I
    },
    Call(C) {
        C.id = optimize(C.id)
        C.args = optimize(C.args)
        return C
    },
    AccessExpression(A) {
        A.object = optimize(A.object)
        A.attribute = optimize(A.attribute)
        return A
    },
    MethodExpression(M) {
        M.object = optimize(M.object)
        M.method = optimize(M.method)
        M.args = optimize(M.args)
        return M
    },
    Pipelines(P) {
        P.pipes = optimize(P.pipes)
        return P
    },
    PipeDec(P) {
        P.inputs = optimize(P.inputs)
        if (P.nextPipe) P.nextPipe = optimize(P.nextPipe)
        return P
    },
    Token(T) {
        return T.value ?? T.lexeme
    },
    Array(A) {
        return A.flatMap(optimize)
    },
}
