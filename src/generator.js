import * as stdlib from "./stdlib.js"

export default function generate(program) {
    const output = []

    const standardFunctions = new Map([
        [stdlib.contents.print, (x) => `console.log(${x})`], //check later for garbage
        //[stdlib.contents.print, x => `console.log(${x})`],
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
            output.push(`let ${gen(v.id)} = ${gen(v.expression)}`)
        },
        VariableObj(v) {
            return targetName(v.id)
        },
        Assignment(a) {
            if (a.self){
                output.push(
                    `this.${gen(a.id)} ${PtoJSOperators(a.assignment)} ${
                        a.expression
                    }`
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
            output.push(
                `function ${gen(f.id)}(${gen(f.parameters).join(", ")}) {`
            )
            gen(f.block)
            output.push(`}`)
        },
        FunctionObj(f) {
            return targetName(f)
        },
        TypeParameterPairDec(p) {
            output.push(`${gen(p.id)}`)
        },
        TypeParameterPairObj(p) {
            return targetName(p)
        },
        PrototypeDec(p) {
            output.push(`class ${gen(p.id)} {`)
            gen(p.attributes)
            gen(p.methods)
            output.push(`}`)
        },
        PrototypeObj(p) {
            return targetName(p)
        },
        AttributeDec(a) {
            output.push(
                `#${gen(a.id)} ${PtoJSOperators(a.assignment)} ${gen(
                    a.expression
                )}`
            )
        },
        AttributeObj(a) {
            return targetName(a)
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
            output.push(
                `for( ${gen(f.assignment)}; ${gen(
                    f.condition.value
                )}; ${gen(f.iteration)}){`
            )
            gen(f.block)
            output.push(`}`)
        },
        ReturnStatement(r) {
            output.push(`return ${r.expression}`)
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
            return `${gen(c.id)}(${gen(c.args).join(", ")})`
        },
        AccessExpression(a) {
            return `${gen(a.object)}.${gen(a.attribute)}`
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
            return `le pipes are not le done yet`
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
