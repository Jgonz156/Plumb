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

const source5 = `
Definitions {
  PROTO BOX {
      ATR INT volume
      BOX FUNC BOX(INT volume) {
          self.volume <== volume
      }
  }
  BOX x <== BOX(5)
  print(x.volume)
}
`

const source6 = `
Definitions {
	BOOL x <== true or false
    BOOL y <== false == false
    INT z <== 2^9
    DNE bob <== none
    list_lit_test <== (INT)||1||
    map_lit_test <== (STR)<<"friend":"john">>
}
`

const source7 = `
Definitions {
	DNE FUNC printer (INT x) {
    print(x)
      return
  }
  while(false){
  	printer(1)
  }
  for(INT i <== 0: i<10: i<++1){
  	if(false){
  		print("This will never print!")
  	}
  }
}
`

const expected = `   1 | Program imports=#2 definition=#3 pipeline=#49
   2 | ImportDec path='"./test_path"'
   3 | Definitions block=#4
   4 | Block statements=[#5,#10,#12,#14,#15,#20,#31,#33,#34,#35,#36,#38,#43,#44,#48]
   5 | VariableDec prototype='INT' id=(Id,"a") assignment=(Sym,"<==") expression=#6
   6 | BinaryExpression left=#7 op='-' right=#8
   7 | BinaryExpression left=(INT,"7") op='+' right=(INT,"2")
   8 | BinaryExpression left=#9 op='+' right=(INT,"4")
   9 | UnaryExpression op='-' right=(INT,"3")
  10 | VariableDec prototype='INT' id=(Id,"b") assignment=(Sym,"<==") expression=#11
  11 | BinaryExpression left=(INT,"8") op='*' right=(INT,"4")
  12 | VariableDec prototype='RAT' id=(Id,"c") assignment=(Sym,"<==") expression=#13
  13 | BinaryExpression left=(INT,"7") op='/' right=(INT,"2")
  14 | VariableDec prototype='STR' id=(Id,"d") assignment=(Sym,"<==") expression=(STR,""ka"")
  15 | FunctionDec prototype='STR' id=(Id,"e") parameters=[#16] block=#17
  16 | TypeParameterPairDec prototype='STR' id=(Id,"f")
  17 | Block statements=[#18]
  18 | ReturnStatement expression=#19
  19 | BinaryExpression left=(Id,"f") op='+' right=(STR,""boom"")
  20 | PrototypeDec id=(Id,"G") block=#21
  21 | Block statements=[#22,#23,#27]
  22 | AttributeDec prototype='STR' id=(Id,"h") assignment=[(Sym,"<==")] expression=[(INT,"2")]
  23 | FunctionDec prototype='G' id=(Id,"G") parameters=[#24] block=#25
  24 | TypeParameterPairDec prototype='STR' id=(Id,"x")
  25 | Block statements=[#26]
  26 | Assignment self='s' id=(Id,"h") assignment=(Sym,"<==") expression=(Id,"h")
  27 | MethodDec prototype='STR' id=(Id,"getH") parameters=[] block=#28
  28 | Block statements=[#29]
  29 | ReturnStatement expression=#30
  30 | AccessExpression object=(Self,"self") attribute=(Id,"h")
  31 | VariableDec prototype='G' id=(Id,"i") assignment=(Sym,"<==") expression=#32
  32 | Call id=(Id,"G") args=[(STR,""this is a good sentence"")]
  33 | ListDec prototype='||DNE||' id=(Id,"j") assignment='<==' list=[(INT,"1"),(RAT,"1.02"),(STR,""bob""),(Id,"i"),(BOOL,"true"),(Id,"empty")]
  34 | MethodExpression object=(Id,"j") method=(Id,"append") args=[(Id,"d")]
  35 | ListDec prototype='||INT||' id=(Id,"k") assignment='<==' list=[(INT,"1"),(INT,"2"),(INT,"5"),(INT,"7"),(INT,"73"),(INT,"45")]
  36 | MethodExpression object=(Id,"k") method=(Id,"remove") args=[#37]
  37 | MethodExpression object=(Id,"k") method=(Id,"search") args=[(INT,"7")]
  38 | MapDec prototype='<<DNE>>' id=(Id,"l") assignment='<==' map=[#39,#40,#42]
  39 | KeyValuePair key=(STR,""name"") value=(STR,""lasagna"")
  40 | KeyValuePair key=(STR,""color"") value=#41
  41 | Call id=(Id,"G") args=[(STR,""red"")]
  42 | KeyValuePair key=(STR,""height"") value=(INT,"12")
  43 | MethodExpression object=(Id,"l") method=(Id,"add") args=[(STR,""awesome""),(BOOL,"true")]
  44 | MapDec prototype='<<INT>>' id=(Id,"m") assignment='<==' map=[#45,#46,#47]
  45 | KeyValuePair key=(STR,""horsepower"") value=(INT,"1200")
  46 | KeyValuePair key=(STR,""price"") value=(INT,"270000")
  47 | KeyValuePair key=(STR,""model_number"") value=(INT,"79")
  48 | MethodExpression object=(Id,"m") method=(Id,"remove") args=[(STR,""price"")]
  49 | Pipelines pipes=[#50,#51,#53,#54,#55,#57,#58,#60]
  50 | Pipe inputs=[(Id,"a"),(Id,"b"),(Id,"c")] op='-->' nextPipe=(Id,"print")
  51 | Pipe inputs=[(Id,"d")] op='-->' nextPipe=#52
  52 | Pipe inputs=[(Id,"e")] op='-->' nextPipe=(Id,"print")
  53 | Pipe inputs=[(Id,"i")] op='-h->' nextPipe=(Id,"print")
  54 | Pipe inputs=[(Id,"j")] op='-->' nextPipe=(Id,"print")
  55 | Pipe inputs=[(Id,"k")] op='--<(' nextPipe=#56
  56 | Pipe inputs=[(Id,"a")] op='-->' nextPipe=(Id,"print")
  57 | Pipe inputs=[(Id,"l")] op='-->' nextPipe=(Id,"print")
  58 | Pipe inputs=[(Id,"m")] op='--<(' nextPipe=#59
  59 | Pipe inputs=[(Id,"a")] op='-->' nextPipe=(Id,"print")
  60 | Pipe inputs=[(Id,"a")] op='-(RAT)->' nextPipe=(Id,"print")`

const expected1 = `   1 | Program imports=null definition=#2 pipeline=#22
   2 | Definitions block=#3
   3 | Block statements=[#4]
   4 | FunctionDec prototype='||INT||' id=(Id,"denominate") parameters=[#5] block=#6
   5 | TypeParameterPairDec prototype='INT' id=(Id,"total")
   6 | Block statements=[#7,#8,#10,#12,#14,#16,#18,#20,#21]
   7 | VariableDec prototype='INT' id=(Id,"current_total") assignment=(Sym,"<==") expression=(Id,"total")
   8 | VariableDec prototype='INT' id=(Id,"quarters") assignment=(Sym,"<==") expression=#9
   9 | BinaryExpression left=(Id,"current_total") op='%' right=(INT,"25")
  10 | Assignment self=null id=(Id,"current_total") assignment=(Sym,"<--") expression=#11
  11 | BinaryExpression left=(INT,"25") op='*' right=(Id,"quarters")
  12 | VariableDec prototype='INT' id=(Id,"dimes") assignment=(Sym,"<==") expression=#13
  13 | BinaryExpression left=(Id,"current_total") op='%' right=(INT,"10")
  14 | Assignment self=null id=(Id,"current_total") assignment=(Sym,"<--") expression=#15
  15 | BinaryExpression left=(INT,"10") op='*' right=(Id,"dimes")
  16 | VariableDec prototype='INT' id=(Id,"nickels") assignment=(Sym,"<==") expression=#17
  17 | BinaryExpression left=(Id,"total") op='%' right=(INT,"5")
  18 | Assignment self=null id=(Id,"current_total") assignment=(Sym,"<--") expression=#19
  19 | BinaryExpression left=(INT,"5") op='*' right=(Id,"nickels")
  20 | ListDec prototype='||INT||' id=(Id,"result") assignment='<==' list=[(Id,"quarters"),(Id,"dimes"),(Id,"nickels"),(Id,"current_total")]
  21 | ReturnStatement expression=(Id,"result")
  22 | Pipelines pipes=[#23]
  23 | Pipe inputs=[(Id,"INPUT")] op='-1->' nextPipe=#24
  24 | Pipe inputs=[(Id,"a")] op='-(INT)->' nextPipe=#25
  25 | Pipe inputs=[(Id,"denominate")] op='-->' nextPipe=(Id,"print")`

const expected2 = `   1 | Program imports=null definition=#2 pipeline=null
   2 | Definitions block=#3
   3 | Block statements=[#4,#5,#6,#8,#12]
   4 | ListDec prototype='||RAT||' id=(Id,"y") assignment='<==' list=[]
   5 | ListDec prototype='||INT||' id=(Id,"x") assignment='<==' list=[(INT,"1"),(INT,"2")]
   6 | Assignment self=null id=(Id,"y") assignment=(Sym,"<++") expression=#7
   7 | ListExp prototype='||INT||' list=[(INT,"3"),(INT,"4")]
   8 | Assignment self=null id=(Id,"y") assignment=(Sym,"<++") expression=#9
   9 | MapExp prototype='<<INT>>' map=[#10,#11]
  10 | KeyValuePair key=(STR,""bob"") value=(INT,"3")
  11 | KeyValuePair key=(STR,""job"") value=(INT,"4")
  12 | Call id=(Id,"print") args=[#13]
  13 | ListExp prototype='||INT||' list=[(INT,"1"),(INT,"2"),(INT,"3"),(INT,"4")]`

const expected3 = `   1 | Program imports=null definition=#2 pipeline=null
   2 | Definitions block=#3
   3 | Block statements=[#4]
   4 | VariableDec prototype='BOOL' id=(Id,"x") assignment=(Sym,"<==") expression=#5
   5 | BinaryExpression left=#6 op='and' right=#8
   6 | BinaryExpression left=#7 op='and' right=(BOOL,"true")
   7 | Call id=(Id,"is_odd") args=[(INT,"23")]
   8 | BinaryExpression left=#9 op='>' right=#10
   9 | AccessExpression object=(Sym,"INT") attribute=(Id,"MAX")
  10 | IndexExpression object=#11 index=(INT,"0")
  11 | ListExp prototype='||INT||' list=[#12]
  12 | AccessExpression object=(Sym,"INT") attribute=(Id,"MIN")`

const expected6 = `   1 | Program imports=null definition=#2 pipeline=null
   2 | Definitions block=#3
   3 | Block statements=[#4,#6,#8,#10,#11,#13]
   4 | VariableDec prototype='BOOL' id=(Id,"x") assignment=(Sym,"<==") expression=#5
   5 | BinaryExpression left=(BOOL,"true") op='or' right=(BOOL,"false")
   6 | VariableDec prototype='BOOL' id=(Id,"y") assignment=(Sym,"<==") expression=#7
   7 | BinaryExpression left=(BOOL,"false") op='==' right=(BOOL,"false")
   8 | VariableDec prototype='INT' id=(Id,"z") assignment=(Sym,"<==") expression=#9
   9 | BinaryExpression left=(INT,"2") op='^' right=(INT,"9")
  10 | VariableDec prototype='DNE' id=(Id,"bob") assignment=(Sym,"<==") expression=(DNE,"none")
  11 | Assignment self=null id=(Id,"list_lit_test") assignment=(Sym,"<==") expression=#12
  12 | ListExp prototype='||INT||' list=[(INT,"1")]
  13 | Assignment self=null id=(Id,"map_lit_test") assignment=(Sym,"<==") expression=#14
  14 | MapExp prototype='<<STR>>' map=[#15]
  15 | KeyValuePair key=(STR,""friend"") value=(STR,""john"")`

const expected7 = `   1 | Program imports=null definition=#2 pipeline=null
   2 | Definitions block=#3
   3 | Block statements=[#4,#9,#12]
   4 | FunctionDec prototype='DNE' id=(Id,"printer") parameters=[#5] block=#6
   5 | TypeParameterPairDec prototype='INT' id=(Id,"x")
   6 | Block statements=[#7,#8]
   7 | Call id=(Id,"print") args=[(Id,"x")]
   8 | ReturnStatement expression=(DNE,"undefined")
   9 | WhileStatement condition=(BOOL,"false") block=#10
  10 | Block statements=[#11]
  11 | Call id=(Id,"printer") args=[(INT,"1")]
  12 | ForStatement assignment=#13 condition=#14 iteration=#15 block=#16
  13 | VariableDec prototype='INT' id=(Id,"i") assignment=(Sym,"<==") expression=(INT,"0")
  14 | BinaryExpression left=(Id,"i") op='<' right=(INT,"10")
  15 | Assignment self=null id=(Id,"i") assignment=(Sym,"<++") expression=(INT,"1")
  16 | Block statements=[#17]
  17 | IfStatement condition=(BOOL,"false") block=#18
  18 | Block statements=[#19]
  19 | Call id=(Id,"print") args=[(STR,""This will never print!"")]`

describe("The AST generator", () => {
  //console.log(ast(source7))
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
  it("produces another correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source6)), expected6)
  })
  it("produces another correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source7)), expected7)
  })
})