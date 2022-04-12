import { 
    PrototypeObj, 
    ListPrototypeObj,
    MapPrototypeObj,
    FunctionObj, 
    VariableObj,
} from "./core.js"

export const contents = Object.freeze(
    {
        BOOL: PrototypeObj.boolean,
        RAT: PrototypeObj.rational,
        INT: PrototypeObj.integer,
        STR: PrototypeObj.string,
        DNE: PrototypeObj.doesNotExist,
        print: new FunctionObj(PrototypeObj.doesNotExist, "print"),
    }
)
  