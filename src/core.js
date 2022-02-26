import util from "util"

export class Program {
    //Example: Definitions {\n INT x <== 1 \n} Pipelines {\n x --> print \n}
    constructor(imports, definition, pipeline){
        this.imports = imports
        this.definition = definition
        this.pipeline = pipeline
    }
}

export class Import {
    constructor(stringPath){
        this.path = stringPath
    }
}

export class Definitions {
    constructor(block){
        this.block = block
    }
}

export class Statement {
    constructor(statement){
        this.statement = statement
    }
}

export class VariableDec {
    constructor(prototype, id, assignment, expression){
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.expression = expression
    }
}

export class Assignment {
    constructor(self, id, assignment, expression){
        this.self = self
        this.id = id
        this.assignment = assignment
        this.expression = expression
    }
}

export class FunctionDec {
    constructor(prototype, id, parameters, block){
        this.prototype = prototype
        this.id = id
        this.parameters = parameters
        this.block = block
    }
}

export class PrototypeDec {
    constructor(id, block){
        this.id = id
        this.block = block
    }
}

export class AttributeDec {
    constructor(prototype, id, assignment, expression){
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.expression = expression
    }
}

export class IfStatement {
    constructor(condition, block){
        this.condition = condition
        this.block = block
    }
}

export class WhileStatement {
    constructor(condition, block){
        this.condition = condition
        this.block = block
    }
}

export class ForStatment {
    constructor(assignment, condition, iteration, block){
        this.assignment = assignment
        this.condition = condition
        this.iteration = iteration
        this.block = block
    }
}

export class ReturnStatement {
    constructor(expression){
        this.expression = expression
    }
}

export class ListDec {
    constructor(prototype, id, assignment, list){
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.list = list
    }
}

export class MapDec {
    constructor(prototype, id, assignment, map){
        this.prototype = prototype
        this.id = id
        this.assignment = assignment
        this.map = map
    }
}

export class Block {
    constructor(statements){
        this.statements = statements
    }
}

export class BinaryExpression {
    constructor(left, op, right){
        this.left = left
        this.op = op
        this.right = right
    }
}

export class UnaryExpression {
    constructor(op, right){
        this.op = op
        this.right = right
    }
}

export class Pipelines {
    constructor(pipes){
        this.pipes = pipes
    }
}

export class Token {
    constructor(tokenType, source){
        this.tokenType = tokenType
        this.source = source
    }

    get lexeme() {
        return this.source.contents
    }

    get description() {
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

// Attach a unique integer tag to every node
function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    if (node.constructor === Token) {
        // Tokens are not tagged themselves, but their values might be
    tag(node?.value)
    } else {
            // Non-tokens are tagged
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
                return `(${e.category},"${e.lexeme}"${e.value ? "," + view(e.value) : ""})`
            }
            if (Array.isArray(e)) return `[${e.map(view)}]`
            return util.inspect(e)
        }
        for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
            let type = node.constructor.name
            let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
            yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
        }
    }

    tag(this)
    return [...lines()].join("\n")
}