import { PrototypeObj } from "./core.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
    const output = []

    const standardFunctions = new Map([
        [stdlib.contents.print, (x) => `console.log(${x})`],
    ])

    const targetName = ((mapping) => {
        return (entity) => {
            if (!mapping.has(entity)) {
                mapping.set(entity, mapping.size + 1)
            }
            return `${entity?.source?._contents ?? entity?.id ?? entity.name ?? entity.description}_${mapping.get(entity)}`
        }
    })(new Map())

    function gen(node) {
        return generators[node.constructor.name](node)
    }

    const opMap = new Map([
        ["<==", "="],
        ["<++", "+="],
        ["<--", "-="],
        ["<//", "/="],
        ["<^^", "**="],
        ["<**", "*="],
        ["and", "&&"],
        ["or", "||"],
        ["^", "**"],
    ])

    const PtoJSOperators = (plumbOp) => opMap?.get(plumbOp) ?? plumbOp

    let constructorFunction = false

    const generators = {
        Program(p) {
            if (p.imports) gen(p.imports)
            if (p.definition) gen(p.definition)
            if (p.pipeline) gen(p.pipeline)
        },
        ImportDec(i) {
            output.push(`import * from ${i.stringPath}`)
        },
        Definitions(d) {
            gen(d.block)
        },
        VariableDec(v) {
            let expressionString = gen(v.expression)
            output.push(`let ${gen(v.id)} = ${ expressionString != undefined ? expressionString : output.pop()}`)
        },
        VariableObj(v) {
            return targetName(v.id)
        },
        Assignment(a) {
            if (a.self){
                output.push(
                    `this.${targetName(a.id)} ${PtoJSOperators(a.assignment)} ${gen(
                        a.expression
                    )}`
                )
                }else{
                output.push(
                    `${gen(a.id)} ${PtoJSOperators(a.assignment)} ${gen(
                        a.expression
                    )}`
                )
                    }
        },
        FunctionDec(f) {
            if(!constructorFunction){
            output.push(
                `function ${gen(f.id)}(${gen(f.parameters).join(", ")}) {`
            )
            gen(f.block)
            output.push(`}`)
        } else {
            constructorFunction = false
        output.push(
            `constructor(${gen(f.parameters).join(", ")}) {`
        )
        gen(f.block)
        output.push(`}`)
        }
        },
        FunctionObj(f) {
            return targetName(f.id)
        },
        TypeParameterPairDec(p) {
            return `${gen(p.id)}`
        },
        TypeParameterPairObj(p) {
            return targetName(p.id)
        },
        PrototypeDec(p) {
            output.push(`class ${gen(p.id)} {`)
            gen(p.id.attributes)
            constructorFunction = true
            gen(p.id.constructorFunc)
            gen(p.id.methods)
            output.push(`}`)
        },
        PrototypeObj(p) {
            return targetName(p)
        },
        AttributeDec(a) {
            output.push(
                `#${gen(a.id)}${PtoJSOperators(a.assignment)}${gen(
                    a.expression
                )}`
            )
        },
        AttributeObj(a) {
            return targetName(a.id)
        },
        MethodDec(m) {
            output.push(`${gen(m.id)}(${gen(m.parameters).join(", ")}){`)
            gen(m.block)
            output.push(`}`)
        },
        MethodObj(m) {
            return targetName(m)
        },
        IfStatement(i) {
            output.push(`if(${gen(i.condition)}){`)
            gen(i.block)
            output.push(`}`)
        },
        WhileStatement(w) {
            output.push(`while(${gen(w.condition)}){`)
            gen(w.block)
            output.push(`}`)
        },
        ForStatement(f) {
            gen(f.iteration)
            gen(f.assignment)
            output.push(
                `for(${output.pop()}; ${gen(
                    f.condition
                )}; ${output.pop()}){`
            )
            gen(f.block)
            output.push(`}`)
        },
        ReturnStatement(r) {
            output.push(`return ${gen(r.expression)}`)
        },
        ListDec(l) {
            output.push(
                `let ${gen(l.id)} ${PtoJSOperators(l.assignment)} [${gen(
                    l.list
                ).join(", ")}]`
            )
        },
        ListExp(l) {
            return `[${gen(l.list).join(", ")}]`
        },
        MapDec(m) {
            output.push(
                `let ${gen(m.id)} ${PtoJSOperators(
                    m.assignment
                )} new Map([${gen(m.map).join(", ")}])`
            )
        },
        MapExp(m) {
            return `new Map([${gen(m.map).join(", ")}])`
        },
        KeyValuePair(k) {
            return `[${gen(k.key)}, ${gen(k.value)}]`
        },
        Block(b) {
            gen(b.statements)
        },
        BinaryExpression(b) {
            return `${gen(b.left)} ${PtoJSOperators(b.op)} ${gen(
                b.right
            )}`
        },
        UnaryExpression(u) {
            return `${PtoJSOperators(u.op)} ${gen(u.right)}`
        },
        IndexExpression(i) {
            return `${gen(i.object)}[${gen(i.index)}]`
        },
        Call(c) {
            if (standardFunctions.has(c.id)) {
                output.push(standardFunctions.get(c.id)(gen(c.args).join(", ")))
                return []
            }
            let objectString = gen(c.id) ? gen(c.id) : output.pop()
            if (c.id instanceof PrototypeObj) output.push(`new ${objectString}(${gen(c.args).join(", ")})`)
            else output.push(`${objectString}(${gen(c.args).join(", ")})`)
        },
        AccessExpression(a) {
            let attributeString = gen(a.attribute)
            return `${gen(a.object)}.${attributeString ? attributeString.substring(1) : output.pop().substring(1)}`
        },
        MethodExpression(m) {
            return `${gen(m.object)}.${gen(m.method)}(${gen(
                m.args
            ).join(", ")})`
        },
        Pipelines(p) {
            gen(p.pipes)
        },
        Pipe(p) {
            throw new Error("Generating Pipes is not implemented yet")
            return `Generating pipes is not implemented yet`
        },
        Number(e) {
            return e
        },
        BigInt(e) {
            return e
        },
        Boolean(e) {
            return e
        },
        String(e) {
            if (e.trim() == "none") return "null"
            else if (e.trim() == "all") return "undefined"
            return e
        },
        Array(a) {
            return a.map(gen)
        },
    }

    gen(program)
    return output.join("\n")
}
