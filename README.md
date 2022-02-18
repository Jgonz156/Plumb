<p align="center">
  <img src="docs/plumb_logo.png" width="40%">
</p>

# Plumb
This language is focused on making it easier to focus on and interact with the "pipelines" that emerge in our workflows. Sometimes it is hard to follow how to follow how other's code operates and by giving our programs a more visually directed structure, we can more easily parse each other's work! Plumb can also be recognized as quite rigid in its structure. By requiring more work into how a program must be written in the language, it provides visual indicators in all programs that can be relied on when readings others' work. For instance, unlike the language Plumb will be compared to, Plumb requires "boilerplate" due to it requiring a definitions and pipeline section to be initialized. In short, an empty page is not a valid Plumb program. The major feature of this langauge is the visualization and ease of multi-threading and parallelization. The pipelines section of a plumb program is meant not to be read in the traditional top-down, line by line fashion. It specifies parallel streams, hence pipelines, of actions to be done side by side. A pipe is a single left-to-right line of instructions in the pipelines section and is meant to be executed from left o right by following the arrow heads. The idea is that you would organize operations that do not inherently rely on one another in new pipes to allow for parallelization.

## Language Overview
- Statically and Strongly Typed
- Visually Rigid for Ease of Readability
- Strong parallel operation support

Below is an in-depth view of Plumb with a comparison to equivalent code in JavaScript

## Built-in Overview

### Comments
`:: pseudocode goes here ::`
They can go anywhere in the language, including in between, and in, statements and pipes!
Disclaimer: There are no single line comments in Plumb, the default comment is multi-line

### Keywords
|Keyword|Description|
|-------|-----------|
|`Definitions`|Used to specify the next block for holding statements and expressions|
|`Pipelines`|Used to specify the next block for holding pipes|
|`return`|Used to specify when a function has reached a terminal state in its operation and what value to receive from it in a call|
|`if`|Used to specify the next block with a conditional|
|`else`|Used after an `if` specified block, `else` is used to specify the next block as the previous `if`'s false condition path|
|`for`|Used to specify how many finite loops happen over a specified block|
|`while`|Used to specify a halt condition over a specified block with an unknown number of loops|
|`print`|Used to output to the command line|
|`OP`|Used for overloading operator functionality into prototypes|
|`INPUT`|Used to represent commandline arguments, as a plumb list, in the `Pipelines` block|
|`DNE`|Type used to represent no, or any, type|
|`BOOL`|Type used to represent booleans|
|`INT`|Type used to represent integers|
|`RAT`|Type used to represent rationals|
|`STR`|Type used to represent strings|
|`FUNC`|Type used to represent functions|
|`PROTO`|Type used to represent prototypes|
|`ATR`|Type used to represent prototype attributes|

### Data Types
|Type|Values|JavaScript|
|----|------|----------|
|Does not exist `DNE`|`empty`|Null `null`|
|Boolean `BOOL`|`true`, `false`|Boolean `true` `false`|
|Integers `INT`|`12`, `79`, `99999`|BigInt `1223345n`|
|Rationals `RAT`|`3.97385`, `7895.2734`|Number `99465.213`|
|String `STR`|`"carrot"`, `"bob"`|String `"phrase"`|
|Function `FUNC`| See code examples |Object\function|
|Prototype `PROTO`| See code examples |Class|

### Data Structures
|Structure|Syntax|JavaScript|
|---|---|---|
|Lists| `\|\| a , b , c \|\|` | `[ a , b , c ]` |
|Maps| `<< a : x , b : y >>` | `{ a : x , b : y }` |

### Operators and Precedence 
|Operator|Symbol|Operational Types|Precedence|Associativity|
|--------|------|-----------------|:------:|:----:|
|Attributor|`.`|Prototypes|1|L to R|
|Indexer|`[]`|Prototypes|1| \| |
|Call|`()`|Functions|1| \| |
|Negation|`!`|Boolean|2|R to L|
|Negation|`-`|Integers, Rationals|2| \| |
|Multiplication|`*`|Integers, Rationals, String|3| L to R |
|Division|`/`|Integers, Rationals|3| \| |
|Modulus|`%`|Integers, Rationals|3| \| |
|Addition|`+`|Integers, Rationals, String|4| \| |
|Subtraction|`-`|Integers, Rationals|4| \| |
|Exponentiation|`^`|Integers, Rationals|5| R to L |
|Less Than|`<`|Integers, Rationals|6|None|
|Less Than or equal|`<=`|Integers, Rationals|6| \| |
|Greater Than|`>`|Integers, Rationals|6| \| |
|Greater Than or equal|`>=`|Integers, Rationals|6| \| |
|Equality|`==`|Boolean, Integers, Rationals|7| \| |
|Inequality|`!=`|Boolean, Integers, Rationals|7| \| |
|Logical AND|`and`|Boolean|8| \| |
|Logical OR|`or`|Boolean|9| \| |
|Assignment by Expression|`<==`|Boolean, Integers, Rationals, String, Prototype Instance|10|R to L|
|Assignment by Addition|`<++`|Integers, Rationals, String|10| \| |
|Assignment by Subtraction|`<--`|Integers, Rationals|10| \| |
|Assignment by Multiplication|`<**`|Integers, Rationals, String|10| \| |
|Assignment by Division|`<//`|Integers, Rationals|10| \| |
|Assignment by Modulus|`<%%`|Integers, Rationals|10| \| |

Note: Prototypes can use the operator (`OP`) key word to adapt functionality

### Pipeline Operators
|Operator|Syntax|Description|
|----|------|----------|
|Injection|a, b, c, ... `-->` target|Takes an arbitrary number of instances on the left and, from left to right, pushes them into the next operation on a pipe|
|Drain|Prototype `-#-#-...->` target|Similar to dot notation, takes a object and takes a copy of the specified attribute "#" and pushes it into the next operation on a pipe. If there are multiple objects to the left of the drain, successively add more attributes to match the number of instances at which point each attribute will specify what it being drained from its corresponding instance|
|Caster|a, b, c, ... `-(` type `)->` target|Takes an arbitrary number of instances on the left and, from left to right, casts them to the specified cast-able type, or cast-able protocol, and pushes them into the next operation|
|Factory|a, b, c, ... `--<(` pipe|Takes an arbitrary number of instances on the left and, for each instance, will create a new pipe for that instance to be pushed into that is a duplication of the rest of the pipe that comes after this operator|

### Functions
|Type|Name|Syntax|Description|
|---|---|---|---|
|DNE|Caster| `type( to_be_casted , cast_type )` |Takes any instance of any type and attempts to cast it to another|
|DNE|Printer| `print( a, b, c, ... )` |Takes any amount of instances of any type and attempts to cast print them to the commandline|
|STR|Uppercase|`STR.uppercase( string_to_uppercase )`|Takes a single String instance and attempts to replace all lowercase characters with their capitalized counterparts|
|STR|Character Count|`STR.c_length( string_to_measure )`|Takes a single String instance and returns the number of, unicode safe, characters in it|

<table>
<tr> <th> Plumb </th> <th> JavaScript </th> </tr>
<tr>
<td>

```
Definitions {
    INT a <== 7+2-(-3+4)
    INT b <== 8*4
    RAT c <== 7/2
    STR d <== "ka"
    STR FUNC e (f) {
        return f + "boom"
    }
    PROTO G {
        ATR STR h
        G(x){
            self.h <== h
        }
    }
    G i <== G("this is a good sentence")
    ||DNE|| j <== || 1, 1.02, "bob", i, true, empty ||
    j.append(d)
    ||INT|| k <== || 1, 2, 5, 7, 73, 45 ||
    k.remove(k.search(7))
    <<DNE>> l <== << "name" : "lasagna" , "color" : G("red"), "height" : 12 >> 
    l.join( << "awesome?" : true >> )
    <<INT>> m <== << "horsepower" : 1200, "price" : 270000 , "model_number" : 79 >> 
    m.remove("price")
}
Pipelines {
    a, b, c --> print
    d --> e --> print
    i -h-> print
    j --> print
    k --<( --> print
    l --> print
    m --<( --> print
}
```

</td> 
<td>

```javascript
var a = 7+2-(-3+4)
var b = 8*4
var c = 7/2
var d = "ka"
function e (f) {
    return f + "boom"
}
class G {
    h
    constructor(x){
        this.h = x
    }
}
var i = new G("this is a good sentence")
var j = [ 1, 1.02, "bob", i, true, null ]
j.push(d)
var k = [ 1, 2, 5, 7, 73, 45 ]
k.splice(k.indexOf(7), 1)
var l = { name : "lasagna" , color : new G("red"), height : 12 }
Object.assign(l, { awesome : true })
var m = { "horsepower" : 1200, "price" : 270000 , "model_number" : 79 }
delete m.price
console.log(a, b, c)
console.log(e(d))
console.log(i.h)
console.log(j)
for ( x in k ){
    console.log(x)
}
console.log(l)
for ( (x, y) in m ){
    console.log(x, y)
}
```

</td>
</tr>
</table>

## Plumb vs JavaScript Examples

#### Default Program
Plumb
```
Definitions {}
Pipelines {}
```
Javascript
```
```

#### Hello World!
Plumb
```
Definitions {
    STR x <== "Hello World!"
}
Pipelines {
    x --> print
}
```
JavaScript
```javascript
console.log("Hello World!")
```