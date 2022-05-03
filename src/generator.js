import * as stdlib from "./stdlib.js"

export default function generate(program) {
    const output = []

    const standardFunctions = new Map([
        [stdlib.contents.print, x => `console.log(${x})`], //check later for garbage
        //[stdlib.contents.print, x => `console.log(${x})`],
    ])

    const targetName = (mapping => {
        return entity => {
            if (!mapping.has(entity)) {
                mapping.set(entity, mapping.size +1)
            }
            return `${entity.name ?? entity.description}_${mapping.get(entity)}`
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

    const PtoJSOperators = plumbOp => opMap?.get(plumbOp) ?? plumbOp

    const generators = {
        Program(p) {
            if(p.imports) gen(p.imports)
            if(p.definition) gen(p.definition)
            if(p.pipeline) gen(p.pipeline)
        },
        ImportDec(i) {
            output.push(`import * from ${i.stringPath}`)
        },
        Definitions(d) {
            gen(d.block)
        },
        VariableDec(v) {
            output.push(`let ${gen(v.id.value)} = ${v.expression.value}`)
        },
        VariableObj(v) {
            return targetName(v)
        },
        Assignment(a) {
            if(a.self) output.push(`this.${gen(a.id.value)} ${PtoJSOperators(a.assignment)} ${a.expression.value}`)
            else output.push(`${gen(a.id.value)} ${PtoJSOperators(a.assignment)} ${gen(a.expression.value)}`)
        },
        FunctionDec(f) {
            output.push(`function ${gen(f.id.value)}(${gen(f.parameters).join(", ")}) {`)
            gen(f.block)
            output.push(`}`)
        },
        FunctionObj(f) {
            return targetName(f)
        },
        TypeParameterPairDec(p) {
            output.push(`${gen(p.id.value)}`)
        },
        TypeParameterPairObj(p) {
            return targetName(p)
        },
        PrototypeDec(p) {
            output.push(`class ${gen(p.id.value)} {`)
            gen(p.attributes)
            gen(p.methods)
            output.push(`}`)
        },
        PrototypeObj(p) {
            return targetName(p)
        },
        AttributeDec(a) {
            output.push(`#${gen(a.id.value)} ${PtoJSOperators(a.assignment)} ${gen(a.expression.value)}`)
        },
        AttributeObj(a) {
            return targetName(a)
        },
        MethodDec(m) {
            output.push(`${gen(m.id.value)}(${gen(m.parameters).join(", ")}){`)
            gen(m.block)
            output.push(`}`)
        },
        MethodObj(m) {
            return targetName(m)
        },
        IfStatement(i) {
            output.push(`if(${gen(i.condition.value)}){`)
            gen(i.block)
            output.push(`}`)
        },
        WhileStatement(w) {
            output.push(`while(${gen(w.condition.value)}){`)
            gen(w.block)
            output.push(`}`)
        },
        ForStatement(f) {
            output.push(`for( ${gen(f.assignment.value)}; ${gen(f.condition.value)}; ${gen(f.iteration.value)}){`)
            gen(f.block)
            output.push(`}`)
        },
        ReturnStatement(r) {
            output.push(`return ${r.expression.value}`)
        },
        ListDec(l) {
            output.push(`let ${gen(l.id.value)} ${PtoJSOperators(l.assignment)} [${gen(l.list).join(", ")}]`)
        },
        ListExp(l) {
            return `[${gen(l.list).join(", ")}]`
        },
        MapDec(m) {
            output.push(`let ${gen(m.id.value)} ${PtoJSOperators(m.assignment)} new Map([${gen(m.map).join(", ")}])`)
        },
        MapExp(m) {
            return `new Map([${gen(m.map).join(", ")}])`
        },
        KeyValuePair(k) {
            return `${gen(k.key.value)} : ${gen(k.value.value)}`
        },
        Block(b) {
            gen(b.statements)
        },
        BinaryExpression(b) {
            return `${gen(b.left.value)} ${PtoJSOperators(b.op)} ${gen(b.right.value)}`
        },
        UnaryExpression(u) {
            return `${PtoJSOperators(u.op)} ${gen(u.right.value)}`
        },
        IndexExpression(i) {
            return `${gen(i.object.value)}[${gen(i.index.value)}]`
        },
        Call(c) {
            return `${gen(c.id.value)}(${gen(c.args).join(", ")})`
        },
        AccessExpression(a) {
            return `${gen(a.object.value)}.${gen(a.attribute.value)}`
        },
        MethodExpression(m) {
            return `${gen(m.object.value)}.${gen(m.method.value)}(${gen(m.args).join(", ")})`
        },
        Pipeline(p) {
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
            return e
        },
        Array(a) {
            return a.map(gen)
        },

    }

    gen(program)
    return output.join("\n")
}