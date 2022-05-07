import util from "util"

export class Program {
    //Example: Definitions {\n INT x <== 1 \n} Pipelines {\n x --> print \n}
    constructor(imports, definition, pipeline) {
        this.imports = imports
        this.definition = definition
        this.pipeline = pipeline
    }
}

export class ImportDec {
    constructor(stringPath) {
        this.path = stringPath
    }
}

export class Definitions {
    constructor(block) {
        this.block = block
    }
}

export class VariableDec {
    constructor(prototype, id, assignment, expression) {
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.expression = expression
    }
}

export class VariableObj {
    constructor(prototype, id) {
        this.prototype = prototype
        this.id = id
    }
}

export class Assignment {
    constructor(self, id, assignment, expression) {
        this.self = self
        this.id = id
        this.assignment = assignment
        this.expression = expression
    }
}

export class FunctionDec {
    constructor(prototype, id, parameters, block) {
        this.prototype = prototype
        this.id = id
        this.parameters = parameters
        this.block = block
    }
}

export class FunctionObj {
    constructor(prototype, id, parameters) {
        this.prototype = prototype
        this.id = id
        this.parameters = parameters
    }
}

export class TypeParameterPairDec {
    constructor(prototype, id) {
        this.prototype = prototype
        this.id = id
    }
}

export class TypeParameterPairObj {
    constructor(prototype, id) {
        this.prototype = prototype
        this.id = id
    }
}

export class PrototypeDec {
    constructor(id, block) {
        this.id = id
        this.block = block
    }
}

export class PrototypeObj {
    static boolean = new PrototypeObj("BOOL")
    static rational = new PrototypeObj("RAT")
    static integer = new PrototypeObj("INT")
    static string = new PrototypeObj("STR")
    static doesNotExist = new PrototypeObj("DNE")
    constructor(id, attributes = [], methods = []) {
        this.id = id
        this.attributes = attributes
        this.methods = methods
    }
}

export class AttributeDec {
    constructor(prototype, id, assignment, expression) {
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.expression = expression
    }
}

export class AttributeObj {
    constructor(prototype, id) {
        this.prototype = prototype
        this.id = id
    }
}

export class MethodDec {
    constructor(prototype, id, parameters, block) {
        this.prototype = prototype
        this.id = id
        this.parameters = parameters
        this.block = block
    }
}

export class MethodObj {
    constructor(prototype, id, parameters) {
        this.prototype = prototype
        this.id = id
        this.parameters = parameters
    }
}

export class IfStatement {
    constructor(condition, block) {
        this.condition = condition
        this.block = block
    }
}

export class WhileStatement {
    constructor(condition, block) {
        this.condition = condition
        this.block = block
    }
}

export class ForStatement {
    constructor(assignment, condition, iteration, block) {
        this.assignment = assignment
        this.condition = condition
        this.iteration = iteration
        this.block = block
    }
}

export class ReturnStatement {
    constructor(expression) {
        this.expression = expression
    }
}

export class ListDec {
    constructor(prototype, id, assignment, list) {
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.list = list
    }
}

export class ListExp {
    constructor(prototype, list) {
        this.prototype = prototype
        this.list = list
    }
}

export class ListPrototypeObj extends PrototypeObj {
    constructor(prototype) {
        super(prototype)
        this.basePrototype = prototype.slice(2, prototype.length - 2)
    }
}

export class MapDec {
    constructor(prototype, id, assignment, map) {
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.map = map
    }
}

export class MapExp {
    constructor(prototype, map) {
        this.prototype = prototype
        this.map = map
    }
}

export class MapPrototypeObj extends PrototypeObj {
    constructor(prototype) {
        super(prototype)
        this.basePrototype = prototype.slice(2, prototype.length - 2)
    }
}

export class KeyValuePair {
    constructor(key, value) {
        this.key = key
        this.value = value
    }
}

export class Block {
    constructor(statements) {
        this.statements = statements
    }
}

export class BinaryExpression {
    constructor(left, op, right) {
        this.left = left
        this.op = op
        this.right = right
    }
}

export class UnaryExpression {
    constructor(op, right) {
        this.op = op
        this.right = right
    }
}

export class IndexExpression {
    constructor(object, index) {
        this.object = object
        this.index = index
    }
}

export class Call {
    constructor(id, args) {
        this.id = id
        this.args = args
    }
}

export class AccessExpression {
    constructor(object, attribute) {
        this.object = object
        this.attribute = attribute
    }
}

export class MethodExpression {
    constructor(object, method, args) {
        this.object = object
        this.method = method
        this.args = args
    }
}

export class Pipelines {
    constructor(pipes) {
        this.pipes = pipes
    }
}

export class PipeDec {
    constructor(inputs, op, nextPipe) {
        this.inputs = inputs
        this.op = op
        this.nextPipe = nextPipe
    }
}

export class PipeObj {
    constructor(inputs, op, outputs, nextPipe, prevPipe) {
        this.inputs = inputs
        this.op = op
        this.outputs = outputs
        this.prevPipe = prevPipe
        this.nextPipe = nextPipe
    }
}

export class Token {
    constructor(category, source) {
        this.category = category
        this.source = source
    }

    get lexeme() {
        return this.source.contents
    }
}

export function error(message, token) {
    if (token) {
        throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
    }
    throw new Error(message)
}

Program.prototype[util.inspect.custom] = function () {
    const tags = new Map()

    function tag(node) {
        if (tags.has(node) || typeof node !== "object" || node === null) return
        if (node.constructor === Token) {
            tag(node?.value)
        } else {
            tags.set(node, tags.size + 1)
            for (const child of Object.values(node)) {
                Array.isArray(child) ? child.forEach(tag) : tag(child)
            }
        }
    }

    function* lines() {
        function view(e) {
            if (tags.has(e)) return `#${tags.get(e)}`
            if (e?.constructor === Token) {
                return `(${e.category},"${e.lexeme}"${
                    e.value ? "," + view(e.value) : ""
                })`
            }
            if (Array.isArray(e)) return `[${e.map(view)}]`
            return util.inspect(e)
        }
        for (let [node, id] of [...tags.entries()].sort(
            (a, b) => a[1] - b[1]
        )) {
            let type = node.constructor.name
            let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
            yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
        }
    }

    tag(this)
    return [...lines()].join("\n")
}
