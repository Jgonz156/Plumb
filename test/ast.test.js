import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const source = `
import "./test_path"
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
    a -(RAT)-> print
}
`

const source1 = `
:: 
This program takes an input off the commandline, casts it to an INT type,
and denominates it into the smallest number of US coins.
::
Definitions {
    ||INT|| FUNC denominate(INT total) {
        INT current_total <== total
        INT quarters <== current_total % 25
        current_total <-- 25 * quarters
        INT dimes <== current_total % 10
        current_total <-- 10 * dimes
        INT nickels <== total % 5
        current_total <-- 5 * nickels
        ||INT|| result <== ||quarters, dimes, nickels, current_total||
        return result
    }
}
Pipelines {
    INPUT -1-> a -(INT)-> denominate --> print
}
`

const source2 = `
Definitions{
	||RAT|| y <== ||||
    ||INT|| x <== ||1,2||
    y <++  (INT) ||3, 4||
    y <++  (INT) <<"bob":3, "job":4>>
    print((INT) ||1,2,3,4||)
    
}
`

const source3 = `
Definitions {
	BOOL x <== ( is_odd(23) and true ) and ( INT.MAX > (INT) || INT.MIN ||[0] )
}
`

const source4 = `
Definitions {
	BOOL x <== (BOOL)<<"cars":True>>["cars"] 
}
`

const expected = `   1 | Program imports=#2 definition=#3 pipeline=#47
   2 | ImportDec path='"./test_path"'
   3 | Definitions block=#4
   4 | Block statements=[#5,#10,#12,#14,#15,#19,#29,#31,#32,#33,#34,#36,#41,#42,#46]
   5 | VariableDec prototype='INT' id='a' assignment=(Sym,"<==") expression=#6
   6 | BinaryExpression left=#7 op='-' right=#8
   7 | BinaryExpression left=(INT,"7") op='+' right=(INT,"2")
   8 | BinaryExpression left=#9 op='+' right=(INT,"4")
   9 | UnaryExpression op='-' right=(INT,"3")
  10 | VariableDec prototype='INT' id='b' assignment=(Sym,"<==") expression=#11
  11 | BinaryExpression left=(INT,"8") op='*' right=(INT,"4")
  12 | VariableDec prototype='RAT' id='c' assignment=(Sym,"<==") expression=#13
  13 | BinaryExpression left=(INT,"7") op='/' right=(INT,"2")
  14 | VariableDec prototype='STR' id='d' assignment=(Sym,"<==") expression=(STR,""ka"")
  15 | FunctionDec prototype='STR' id='e' parameters=[(STR Parameter,"STR f")] block=#16
  16 | Block statements=[#17]
  17 | ReturnStatement expression=#18
  18 | BinaryExpression left=(Id,"f") op='+' right=(STR,""boom"")
  19 | PrototypeDec id='G' block=#20
  20 | Block statements=[#21,#22,#25]
  21 | AttributeDec prototype='STR' id='h' assignment='<== 2' expression=[(INT,"2")]
  22 | FunctionDec prototype='G' id='G' parameters=[(STR Parameter,"STR x")] block=#23
  23 | Block statements=[#24]
  24 | Assignment self='s' id='h' assignment='<==' expression=(Id,"h")
  25 | MethodDec prototype='STR' id='getH' parameters=[] block=#26
  26 | Block statements=[#27]
  27 | ReturnStatement expression=#28
  28 | AttributeExpression prototype=(Self,"self") attribute='h'
  29 | VariableDec prototype='G' id='i' assignment=(Sym,"<==") expression=#30
  30 | Call id=(Id,"G") args=[(STR,""this is a good sentence"")]
  31 | ListDec prototype='||DNE||' id='j' assignment='<==' list=[(INT,"1"),(RAT,"1.02"),(STR,""bob""),(Id,"i"),(BOOL,"true"),(Id,"empty")]
  32 | MethodExpression prototype=(Id,"j") method='append' args=[(Id,"d")]
  33 | ListDec prototype='||INT||' id='k' assignment='<==' list=[(INT,"1"),(INT,"2"),(INT,"5"),(INT,"7"),(INT,"73"),(INT,"45")]
  34 | MethodExpression prototype=(Id,"k") method='remove' args=[#35]
  35 | MethodExpression prototype=(Id,"k") method='search' args=[(INT,"7")]
  36 | MapDec prototype='<<DNE>>' id='l' assignment='<==' map=[#37,#38,#40]
  37 | KeyValuePair key=(STR,""name"") value=(STR,""lasagna"")
  38 | KeyValuePair key=(STR,""color"") value=#39
  39 | Call id=(Id,"G") args=[(STR,""red"")]
  40 | KeyValuePair key=(STR,""height"") value=(INT,"12")
  41 | MethodExpression prototype=(Id,"l") method='add' args=[(STR,""awesome""),(BOOL,"true")]
  42 | MapDec prototype='<<INT>>' id='m' assignment='<==' map=[#43,#44,#45]
  43 | KeyValuePair key=(STR,""horsepower"") value=(INT,"1200")
  44 | KeyValuePair key=(STR,""price"") value=(INT,"270000")
  45 | KeyValuePair key=(STR,""model_number"") value=(INT,"79")
  46 | MethodExpression prototype=(Id,"m") method='remove' args=[(STR,""price"")]
  47 | Pipelines pipes=[#48,#49,#51,#52,#53,#55,#56,#58]
  48 | Pipe inputs=[(Id,"a"),(Id,"b"),(Id,"c")] op='-->' nextPipe=(Id,"print")
  49 | Pipe inputs=[(Id,"d")] op='-->' nextPipe=#50
  50 | Pipe inputs=[(Id,"e")] op='-->' nextPipe=(Id,"print")
  51 | Pipe inputs=[(Id,"i")] op='-h->' nextPipe=(Id,"print")
  52 | Pipe inputs=[(Id,"j")] op='-->' nextPipe=(Id,"print")
  53 | Pipe inputs=[(Id,"k")] op='--<(' nextPipe=#54
  54 | Pipe inputs=[(Id,"a")] op='-->' nextPipe=(Id,"print")
  55 | Pipe inputs=[(Id,"l")] op='-->' nextPipe=(Id,"print")
  56 | Pipe inputs=[(Id,"m")] op='--<(' nextPipe=#57
  57 | Pipe inputs=[(Id,"a")] op='-->' nextPipe=(Id,"print")
  58 | Pipe inputs=[(Id,"a")] op='-(RAT)->' nextPipe=(Id,"print")`

const expected1 = `   1 | Program imports=null definition=#2 pipeline=#21
   2 | Definitions block=#3
   3 | Block statements=[#4]
   4 | FunctionDec prototype='||INT||' id='denominate' parameters=[(INT Parameter,"INT total")] block=#5
   5 | Block statements=[#6,#7,#9,#11,#13,#15,#17,#19,#20]
   6 | VariableDec prototype='INT' id='current_total' assignment=(Sym,"<==") expression=(Id,"total")
   7 | VariableDec prototype='INT' id='quarters' assignment=(Sym,"<==") expression=#8
   8 | BinaryExpression left=(Id,"current_total") op='%' right=(INT,"25")
   9 | Assignment self=null id='current_total' assignment='<--' expression=#10
  10 | BinaryExpression left=(INT,"25") op='*' right=(Id,"quarters")
  11 | VariableDec prototype='INT' id='dimes' assignment=(Sym,"<==") expression=#12
  12 | BinaryExpression left=(Id,"current_total") op='%' right=(INT,"10")
  13 | Assignment self=null id='current_total' assignment='<--' expression=#14
  14 | BinaryExpression left=(INT,"10") op='*' right=(Id,"dimes")
  15 | VariableDec prototype='INT' id='nickels' assignment=(Sym,"<==") expression=#16
  16 | BinaryExpression left=(Id,"total") op='%' right=(INT,"5")
  17 | Assignment self=null id='current_total' assignment='<--' expression=#18
  18 | BinaryExpression left=(INT,"5") op='*' right=(Id,"nickels")
  19 | ListDec prototype='||INT||' id='result' assignment='<==' list=[(Id,"quarters"),(Id,"dimes"),(Id,"nickels"),(Id,"current_total")]
  20 | ReturnStatement expression=(Id,"result")
  21 | Pipelines pipes=[#22]
  22 | Pipe inputs=[(Id,"INPUT")] op='-1->' nextPipe=#23
  23 | Pipe inputs=[(Id,"a")] op='-(INT)->' nextPipe=#24
  24 | Pipe inputs=[(Id,"denominate")] op='-->' nextPipe=(Id,"print")`

const expected2 = `   1 | Program imports=null definition=#2 pipeline=null
   2 | Definitions block=#3
   3 | Block statements=[#4,#5,#6,#8,#12]
   4 | ListDec prototype='||RAT||' id='y' assignment='<==' list=[]
   5 | ListDec prototype='||INT||' id='x' assignment='<==' list=[(INT,"1"),(INT,"2")]
   6 | Assignment self=null id='y' assignment='<++' expression=#7
   7 | ListExp prototype='||INT||' list=[(INT,"3"),(INT,"4")]
   8 | Assignment self=null id='y' assignment='<++' expression=#9
   9 | MapExp prototype='<<INT>>' map=[#10,#11]
  10 | KeyValuePair key=(STR,""bob"") value=(INT,"3")
  11 | KeyValuePair key=(STR,""job"") value=(INT,"4")
  12 | Call id=(Id,"print") args=[#13]
  13 | ListExp prototype='||INT||' list=[(INT,"1"),(INT,"2"),(INT,"3"),(INT,"4")]`

const expected3 = `   1 | Program imports=null definition=#2 pipeline=null
   2 | Definitions block=#3
   3 | Block statements=[#4]
   4 | VariableDec prototype='BOOL' id='x' assignment=(Sym,"<==") expression=#5
   5 | BinaryExpression left=#6 op='and' right=#8
   6 | BinaryExpression left=#7 op='and' right=(BOOL,"true")
   7 | Call id=(Id,"is_odd") args=[(INT,"23")]
   8 | BinaryExpression left=#9 op='>' right=#10
   9 | AttributeExpression prototype=(Sym,"INT") attribute='MAX'
  10 | IndexExpression object=#11 index=(INT,"0")
  11 | ListExp prototype='||INT||' list=[#12]
  12 | AttributeExpression prototype=(Sym,"INT") attribute='MIN'`

describe("The AST generator", () => {
  console.log(ast(source4))
  it("produces a correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source)), expected)
  })
  it("produces another correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source1)), expected1)
  })
  it("produces another correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source2)), expected2)
  })
  it("produces another correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source3)), expected3)
  })
})