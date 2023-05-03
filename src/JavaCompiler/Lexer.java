package JavaCompiler;

import java.util.*;
import java.util.regex.*;
import java.util.stream.Stream;

import JavaCompiler.Core.Token;

class Lexer {

    ArrayList<Token> tokens = new ArrayList<Token>();
    ArrayList<Pattern> patternList = new ArrayList<Pattern>();

    Pattern structurePattern = Pattern.compile("^[}{)(,:#\\[\\]]|^\\|\\||^<<|^>>");
    Pattern whiteSpacePattern = Pattern.compile("^ |^\\t");
    Pattern keywordPattern = Pattern.compile("^continue|^break|^self|^none|^all|^FUNC|^while|^for|^if|^return|^true|^false|^OP|^Definitions|^Pipelines|^import|^PROTO|^ATR");
    //static Pattern literalPattern = Pattern.compile("\\d+(.\\d+)?([Ee][-+]?\\d+)?|\\\".*?\\\"|^[a-z][_\\w\\d]*|\\|\\|.*?\\|\\||<<.*?>>", 0);
    Pattern prototypePattern = Pattern.compile("^[A-Z]+|^\\|\\|[A-Z]+\\|\\||^<<[A-Z]+>>");
    Pattern integerRationalLiteralPattern = Pattern.compile("^\\d+(\\.\\d+)?([Ee][-+]?\\d+)?");
    Pattern stringLiteralPattern = Pattern.compile("^\\\".*?\\\"");
    Pattern idLiteralPattern = Pattern.compile("^[a-z][_\\w\\d]*");
    //Pattern listLiteralPattern = Pattern.compile("^\\|\\|.*?\\|\\|");
    //Pattern mapLiteralPattern = Pattern.compile("<<.*?>>");
    Pattern operatorPattern = Pattern.compile("^--<\\(|^-(.+?-)+>|^-\\(.+?\\)->|^-->|^\\(.*?\\)|^<==|^<\\+\\+|^<--|^<\\*\\*|^<//|^<%%|^>=|^==|^!=|^<=|^!|^-|^\\^|^\\*|^/|^%|^\\+|^<|^>|^\\.|^and|^or");
                    
    Lexer(String program){
        this.patternList.add(keywordPattern);
        this.patternList.add(prototypePattern);
        this.patternList.add(integerRationalLiteralPattern);
        this.patternList.add(stringLiteralPattern);
        this.patternList.add(idLiteralPattern);
        //this.patternList.add(listLiteralPattern);
        //this.patternList.add(mapLiteralPattern);
        this.patternList.add(operatorPattern);
        Integer lineNumber = 1;
        
        String commentlessProgram = Pattern.compile("::.*?::", 0x20).matcher(program).replaceAll("").trim();

        for(String line : commentlessProgram.split("\n")) {
            this.tokens.addAll(TokenizeLine(lineNumber++, line.trim()));
        }
    }

    private List<Token> TokenizeLine(Integer lineNumber, String line){
        ArrayList<Token> lineTokens = new ArrayList<Token>();

        int totalLineLength = line.length();
        for(int i = 0; i < totalLineLength;){
            //System.out.println(line);
            while(whiteSpacePattern.matcher(line).find()){
                line = line.substring(1);
                i++;
            }

            Matcher structureMatcher = structurePattern.matcher(line);
            if(structureMatcher.find()){
                String structureMatched = structureMatcher.group();
                Token StructureToken = new Token("structure", structureMatched, lineNumber, i);
                lineTokens.add(StructureToken);
                line = line.substring(structureMatched.length());
                i += structureMatched.length();
                continue;
            }

            String matched = "";
            Token newToken = null;

            for(int index = 0; index < patternList.size(); index++){
                Matcher matcher = patternList.get(index).matcher(line);
                if(matcher.find()){
                    matched = matcher.group();
                    String category = "default";
                    switch(index){
                        case 0 -> category = "keyword";
                        case 1 -> category = "prototype";
                        case 2 -> category = "integer/rational";
                        case 3 -> category = "string";
                        case 4 -> category = "id";
                        //case 5 -> category = "list";
                        //case 5 -> category = "map";
                        case 5 -> category = "operator";
                    }
                    newToken = new Token(category, matched, lineNumber, i);
                    break;
                }
            }
            
            lineTokens.add(newToken);
            i += matched.length();
            line = line.substring(matched.length());
            //System.out.println(lineTokens.toString());
        }

        //System.out.println(lineTokens.toString());
        lineTokens.add(new Token("structure", "\n", lineNumber, totalLineLength));
        return lineTokens;
    }

    @Override
    public String toString(){
        return this.tokens.toString();
    }

    public static void main(String[] args){
        String program = """
            ::::

            :: ::
            
            ::
            ::
            
            :: the test is whatever ::
            
            :: Just making a bunch of tests to ensure the multi
             line comments are working correctly
            ::
            
            import \"test/fileone\"
            import \"test/filetwo\"
            import \"test/filethree\"

            Definitions {
                BOOL bob <== !true
                INT a <== 7+2-(-3+4)
                a <%% 10^2
                INT b <== 8*4
                b <-- 12 % 3
                RAT c <== 7/2
                c <** 2
                c <// 2
                c <** 2
                STR d <== \"ka\"
                d <++ \"lima\"
                STR FUNC e ( STR f, STR x ) {
                    return f + \"boom\" + x
                }
                DNE FUNC consume ( DNE food ) {
                    return
                }
                :: gotta make sure ::
                PROTO G {
                    ATR STR h
                    G FUNC G( STR x ){
                        self.:: Hey whats goin on in here? ::h <== h
                    }
                    ATR STR FUNC getH(){
                    	return self.h
                    }
                }
                if(1::
                Hey look I blew up your conditional bozo
                ::!= any){
                	while(2 > 7){
                    	break
                    }
                }
                for(INT bobbel <== 0 : bobbel <= 20 : bobbel <++ 1){
                	continue
                }
                G i <== G(\"this is a good sentence\")
                ||DNE|| j <== #DNE#|| 1, 1.02, \"bob\", i, true, empty ||
                j.append(d)
                print(j[2])
                ||INT|| k <== #INT#|| 1, 2, 5, 7, 73, 45 ||
                k.remove(k.search(7))
                <<DNE>> l <== #DNE#<< \"name\" : \"lasagna\" , \"color\" : G(\"red\"), \"height\" : 12 >> 
                l.add( \"awesome\", true )
                <<INT>> m <== #INT#<< \"horsepower\" : 1200, \"price\" : 270000 , \"model_number\" : 79 >> 
                m.remove(\"price\")
                k <== #INT#||1||
                m <== #INT#<< \"pranked\" : 1 >>
                } Pipelines {
                    a, b, c --> print
                    c -(INT)-> consume
                    d, d --> e --> print
                    i -h-> print
                    i, i -h-h-> consume
                    j --> print
                    k --<( a --> print
                    l --> print
                    m --<( a --> print
                }
                """;
        Lexer croccy = new Lexer(program);

        System.out.println(croccy);
    }

}