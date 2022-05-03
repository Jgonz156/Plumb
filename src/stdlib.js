import {
    PrototypeObj,
    ListPrototypeObj,
    MapPrototypeObj,
    FunctionObj,
    VariableObj,
    MethodObj,
    Token,
} from "./core.js"

//Object.assign(ListPrototypeObj, { methods : [new MethodObj(PrototypeObj.doesNotExist, "append", [new Token("DNE", "newElement")])] })

export const contents = Object.freeze({
    BOOL: PrototypeObj.boolean,
    RAT: PrototypeObj.rational,
    INT: PrototypeObj.integer,
    STR: PrototypeObj.string,
    DNE: PrototypeObj.doesNotExist,
    print: new FunctionObj(PrototypeObj.doesNotExist, "print"),
    append: new MethodObj(PrototypeObj.doesNotExist, "append", [
        new Token("DNE", "newElement"),
    ]),
})
