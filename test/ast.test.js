import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const source = `
Definitions {
    INT a <== 7+2-(-3+4)
    INT b <== 8*4
    RAT c <== 7/2
    STR d <== "ka"
    STR FUNC e ( STR f ) {
        return f + "boom"
    }
    PROTO G {
        ATR STR h <== 2
        G FUNC G( STR x ){
            self.h <== h
        }
        ATR STR FUNC getH(){
        	return self.h
        }
    }
    G i <== G("this is a good sentence")
    ||DNE|| j <== || 1, 1.02, "bob", i, true, empty ||
    j.append(d)
    ||INT|| k <== || 1, 2, 5, 7, 73, 45 ||
    k.remove(k.search(7))
    <<DNE>> l <== << "name" : "lasagna" , "color" : G("red"), "height" : 12 >> 
    l.add( "awesome", true )
    <<INT>> m <== << "horsepower" : 1200, "price" : 270000 , "model_number" : 79 >> 
    m.remove("price")
} Pipelines {
    a, b, c --> print
    d --> e --> print
    i -h-> print
    j --> print
    k --<( a --> print
    l --> print
    m --<( a --> print
}
`

const expected = `   1 | Program imports=null definition=#2 pipeline=#46
   2 | Definitions block=#3
   3 | Statement statement=[#4,#9,#11,#13,#14,#18,#28,#30,#31,#32,#33,#35,#40,#41,#45]
   4 | VariableDec prototype='INT' id='a' assignment=(Sym,"<==") expression=#5
   5 | BinaryExpression left=#6 op='-' right=#7
   6 | BinaryExpression left=(INT,"7") op='+' right=(INT,"2")
   7 | BinaryExpression left=#8 op='+' right=(INT,"4")
   8 | UnaryExpression op='-' right=(INT,"3")
   9 | VariableDec prototype='INT' id='b' assignment=(Sym,"<==") expression=#10
  10 | BinaryExpression left=(INT,"8") op='*' right=(INT,"4")
  11 | VariableDec prototype='RAT' id='c' assignment=(Sym,"<==") expression=#12
  12 | BinaryExpression left=(INT,"7") op='/' right=(INT,"2")
  13 | VariableDec prototype='STR' id='d' assignment=(Sym,"<==") expression=(STR,""ka"")
  14 | FunctionDec prototype='STR' id='e' parameters=[(STR Parameter,"STR f")] block=#15
  15 | Statement statement=[#16]
  16 | ReturnStatement expression=#17
  17 | BinaryExpression left=(Id,"f") op='+' right=(STR,""boom"")
  18 | PrototypeDec id='G' block=#19
  19 | Statement statement=[#20,#21,(Id,"ATR"),#24]
  20 | AttributeDec prototype='STR' id='h' assignment='<== 2' expression=[(INT,"2")]
  21 | FunctionDec prototype='G' id='G' parameters=[(STR Parameter,"STR x")] block=#22
  22 | Statement statement=[#23]
  23 | Assignment self='s' id='h' assignment='<==' expression=(Id,"h")
  24 | FunctionDec prototype='STR' id='getH' parameters=[] block=#25
  25 | Statement statement=[#26]
  26 | ReturnStatement expression=#27
  27 | AttributeExpression prototype=(Self,"self") attribute='h'
  28 | VariableDec prototype='G' id='i' assignment=(Sym,"<==") expression=#29
  29 | Call id=(Id,"G") args=[(STR,""this is a good sentence"")]
  30 | ListDec prototype='||DNE||' id='j' assignment='<==' list=[(INT,"1"),(RAT,"1.02"),(STR,""bob""),(Id,"i"),(BOOL,"true"),(Id,"empty")]
  31 | MethodExpression prototype=(Id,"j") method='append' args=[(Id,"d")]
  32 | ListDec prototype='||INT||' id='k' assignment='<==' list=[(INT,"1"),(INT,"2"),(INT,"5"),(INT,"7"),(INT,"73"),(INT,"45")]
  33 | MethodExpression prototype=(Id,"k") method='remove' args=[#34]
  34 | MethodExpression prototype=(Id,"k") method='search' args=[(INT,"7")]
  35 | MapDec prototype='<<DNE>>' id='l' assignment='<==' map=[#36,#37,#39]
  36 | KeyValuePair key=(STR,""name"") value=(STR,""lasagna"")
  37 | KeyValuePair key=(STR,""color"") value=#38
  38 | Call id=(Id,"G") args=[(STR,""red"")]
  39 | KeyValuePair key=(STR,""height"") value=(INT,"12")
  40 | MethodExpression prototype=(Id,"l") method='add' args=[(STR,""awesome""),(BOOL,"true")]
  41 | MapDec prototype='<<INT>>' id='m' assignment='<==' map=[#42,#43,#44]
  42 | KeyValuePair key=(STR,""horsepower"") value=(INT,"1200")
  43 | KeyValuePair key=(STR,""price"") value=(INT,"270000")
  44 | KeyValuePair key=(STR,""model_number"") value=(INT,"79")
  45 | MethodExpression prototype=(Id,"m") method='remove' args=[(STR,""price"")]
  46 | Pipelines pipes=[#47,#48,#50,#51,#52,#54,#55]
  47 | Pipe inputs=[(Id,"a"),(Id,"b"),(Id,"c")] op='-->' nextPipe=(Id,"print")
  48 | Pipe inputs=[(Id,"d")] op='-->' nextPipe=#49
  49 | Pipe inputs=[(Id,"e")] op='-->' nextPipe=(Id,"print")
  50 | Pipe inputs=[(Id,"i")] op='-h->' nextPipe=(Id,"print")
  51 | Pipe inputs=[(Id,"j")] op='-->' nextPipe=(Id,"print")
  52 | Pipe inputs=[(Id,"k")] op='--<(' nextPipe=#53
  53 | Pipe inputs=[(Id,"a")] op='-->' nextPipe=(Id,"print")
  54 | Pipe inputs=[(Id,"l")] op='-->' nextPipe=(Id,"print")
  55 | Pipe inputs=[(Id,"m")] op='--<(' nextPipe=#56
  56 | Pipe inputs=[(Id,"a")] op='-->' nextPipe=(Id,"print")`

describe("The AST generator", () => {
  it("produces a correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source)), expected)
  })
})