package JavaCompiler;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Optional;
import java.util.Queue;

import JavaCompiler.Core.*;

public class Parser {

    Queue<Token> lexemes;
    Program root;

    Parser(ArrayList<Token> lexemes) throws UnexpectedMatchException {
        this.lexemes = new LinkedList<Token>(lexemes);
        this.root = parseProgram();
    }

    private Boolean at(String candidate){
        //System.out.print("AT --> ");
        //System.out.println(candidate);
        return candidate.equals(lexemes.element().category()) || candidate.equals(lexemes.element().lexeme());
    }

    private Token at(){
        //System.out.print("AT --> ");
        //System.out.println(lexemes.element());
        return lexemes.element();
    }

    private Token match(String expected) throws UnexpectedMatchException {
        //System.out.print("MATCH --> ");
        //System.out.println(expected);
        if(this.at(expected)){
            return this.lexemes.remove();
        } else {
            throw new UnexpectedMatchException("Expected: " + expected + " But got: " + this.lexemes.element().toString() + " Instead." );
        }
    }

    private Token match() {
        //System.out.print("MATCH --> ");
        Token bob = this.lexemes.remove();
        //System.out.println(bob);
        return bob;
    }

    private Queue<Token> pull(int amountToPull){
        Queue<Token> pulledTokens = new LinkedList<Token>();
        for(int i = 0; i < amountToPull; i++){
            pulledTokens.add(this.lexemes.remove());
        }
        return pulledTokens;
    }

    private LinkedList<Token> pull(String pullTill){
        LinkedList<Token> pulledTokens = new LinkedList<Token>();
        for(Token token = this.lexemes.remove(); !token.lexeme().equals(pullTill); token = this.lexemes.remove()){
            pulledTokens.add(token);
        }
        return pulledTokens;
    }

    private Queue<Token> slide(int amountToSlide){
        Queue<Token> lexemeCopy = new LinkedList<Token>();
        for(Token token: this.lexemes){
            Token copy = new Token(token.category(), token.lexeme(), token.line(), token.column());
            lexemeCopy.add(copy);
        }
        Queue<Token> slidTokens = new LinkedList<Token>();
        for(int i = 0; i < amountToSlide; i++){
            slidTokens.add(lexemeCopy.remove());
        }
        return slidTokens;
    }

    private LinkedList<Token> slideTill(String slideTill){
        Queue<Token> lexemeCopy = new LinkedList<Token>();
        for(Token token: this.lexemes){
            Token copy = new Token(token.category(), token.lexeme(), token.line(), token.column());
            lexemeCopy.add(copy);
        }

        LinkedList<Token> slidTokens = new LinkedList<Token>();
        for(Token token = lexemeCopy.remove(); !token.lexeme().equals(slideTill); token = lexemeCopy.remove()){
            slidTokens.add(token);
        }
        return slidTokens;
    }

    private void whiteSpaceRemover() throws UnexpectedMatchException {
        if(this.lexemes.size() > 0){
            while(at("\n")){
                match("\n");
                if(this.lexemes.size() <= 0){
                    break;
                }
            }
        }
    }

    private Program parseProgram() throws UnexpectedMatchException {
        Optional<ArrayList<ImportDec>> imports = parseImportDec();
        whiteSpaceRemover();
        Optional<DefinitionsDec> definition = parseDefinitionsDec();
        whiteSpaceRemover();
        Optional<PipelinesDec> pipeline = parsePipelinesDec();

        return new Program(imports, definition, pipeline);
    }

    private Optional<ArrayList<ImportDec>> parseImportDec() throws UnexpectedMatchException {
        if(at("import")){
            Optional<ArrayList<ImportDec>> imports = Optional.of(new ArrayList<ImportDec>());
            while(at("import")){
                match("import");
                String path = match().lexeme();
                imports.get().add(new ImportDec(path));
                whiteSpaceRemover();
            }
            return imports;
        } else {
            return Optional.empty();
        }
    }

    private Optional<DefinitionsDec> parseDefinitionsDec() throws UnexpectedMatchException {
        if(at("Definitions")){
            Optional<ArrayList<Statement>> statements = Optional.of(new ArrayList<Statement>());
            match("Definitions");
            match("{");
            whiteSpaceRemover();
            while(!at("}")){
                Statement statement = parseStatement();
                statements.get().add(statement);
                whiteSpaceRemover();
            }
            match("}");
            return Optional.of(new DefinitionsDec(statements));
        } else {
            return Optional.empty();
        }
    }

    private Statement parseStatement() throws UnexpectedMatchException {
        Queue<Token> slidTokens = slide(3);
        Token first = slidTokens.remove();
        Token second = slidTokens.remove();
        Token third = slidTokens.remove();
        whiteSpaceRemover();
        return switch(first.category()){
            case "keyword" -> switch(first.lexeme()){
                case "self" -> parseAssignment();
                case "PROTO" -> parsePrototypeDec();
                case "ATR" -> switch(third.category()){
                        case "keyword" -> parseMethodDec();
                        case "structure" -> slideTill("\n").stream().map(t -> t.lexeme()).filter(lex -> lex.equals("FUNC")).count() > 0 ? parseMethodDec() : parseAttributeDec();
                        default -> parseAttributeDec(); //case "id"
                    };
                case "if" -> parseIfStatement();
                case "while" -> parseWhileStatement();
                case "for" -> parseForStatement();
                case "return" -> parseReturnStatement();
                case "continue" -> parseContinueStatement();
                default -> parseBreakStatement(); //case "break"
            };
            case "prototype" -> switch(second.category()){
                case "keyword" -> switch(third.category()){
                    case "id" -> parseFunctionDec();
                    default -> parseConstructorDec(); //case "prototype"
                };
                default -> parseVariableDec(); //case "id"
            };
            case "structure" -> slideTill("\n").stream().map(t -> t.lexeme()).filter(lex -> lex.equals("FUNC")).count() > 0 ? parseFunctionDec() : parseVariableDec();
            case "id" -> switch(second.lexeme()){
                case "<==" -> parseAssignment();
                case "<++" -> parseAssignment();
                case "<--" -> parseAssignment();
                case "<**" -> parseAssignment();
                case "<//" -> parseAssignment();
                case "<%%" -> parseAssignment();
                default -> parseExpressionStatement(); //case non-assigment operator
            };
            default -> parseExpressionStatement();
        };
    }

    private Prototype parsePrototype() throws UnexpectedMatchException {
        if(at("||")){
            match("||");
            Prototype innerType = parsePrototype();
            match("||");
            return new ListPrototype(innerType);
        } else if(at("<<")){
            match("<<");
            Prototype innerType = parsePrototype();
            match(">>");
            return new MapPrototype(innerType);
        } else {
            String prototype = match("prototype").lexeme();
            Prototype type = switch(prototype){
                case "INT" -> BasePrototype.INT;
                case "RAT" -> BasePrototype.RAT;
                case "STR" -> BasePrototype.STR;
                case "BOOL" -> BasePrototype.BOOL;
                case "DNE" -> BasePrototype.DNE;
                default -> new BasePrototype(prototype); //don't make a new one everytime, make sure its stored
            };
            return type;
        }
        
    }

    private VariableDec parseVariableDec() throws UnexpectedMatchException {
        Prototype type = parsePrototype();
        String identifier = match("id").lexeme();
        String operator = match("operator").lexeme();
        Expression expression = parseExpression();

        return new VariableDec(type, identifier, operator, expression);
    }

    private Assignment parseAssignment() throws UnexpectedMatchException {
        Boolean selfAssign = false;

        if(at("self")){
            selfAssign = true;
            match("self");
            match(".");
        }

        String identifier = match("id").lexeme();
        String operator = match("operator").lexeme();
        Expression expression = parseExpression();
        
        return new Assignment(selfAssign, identifier, operator, expression);
    }

    private FunctionDec parseFunctionDec() throws UnexpectedMatchException {
        ArrayList<ParameterDec> parameters = new ArrayList<ParameterDec>();
        ArrayList<Statement> statements = new ArrayList<Statement>();
        Prototype returnType = parsePrototype();
        match("keyword");
        String identifier = match("id").lexeme();
        match("(");
        while(!at(")")){
            ParameterDec newParam = parseParameterDec();
            parameters.add(newParam);
            if(at(",")){
                match(",");
            }
        }
        match(")");
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new FunctionDec(returnType, identifier, parameters, statements);
    }

    private ParameterDec parseParameterDec() throws UnexpectedMatchException {
        Prototype type = parsePrototype();
        String identifier = match("id").lexeme();
        return new ParameterDec(type, identifier);
    }

    private PrototypeDec parsePrototypeDec() throws UnexpectedMatchException {
        ArrayList<Statement> statements = new ArrayList<Statement>();
        match("keyword");
        String identifier = match("prototype").lexeme();
        Prototype type = new BasePrototype(identifier);
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new PrototypeDec(type, identifier, statements);
    }

    private AttributeDec parseAttributeDec() throws UnexpectedMatchException {
        match("keyword");
        Prototype type = parsePrototype();
        String identifier = match("id").lexeme();
        if(at("operator")){
            Optional<String> operator = Optional.of(match("").lexeme());
            Optional<Expression> expression = Optional.of(parseExpression());
            return new AttributeDec(type, identifier, operator, expression);
        } else {
            return new AttributeDec(type, identifier, Optional.empty(), Optional.empty());
        }
    }

    private MethodDec parseMethodDec() throws UnexpectedMatchException {
        match("keyword");
        ArrayList<ParameterDec> parameters = new ArrayList<ParameterDec>();
        ArrayList<Statement> statements = new ArrayList<Statement>();
        Prototype returnType = parsePrototype();
        match("keyword");
        String identifier = match("id").lexeme();
        match("(");
        while(!at(")")){
            ParameterDec newParam = parseParameterDec();
            parameters.add(newParam);
        }
        match(")");
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new MethodDec(returnType, identifier, parameters, statements);
    }

    private ConstructorDec parseConstructorDec() throws UnexpectedMatchException {
        ArrayList<ParameterDec> parameters = new ArrayList<ParameterDec>();
        ArrayList<Statement> statements = new ArrayList<Statement>();
        Prototype type = parsePrototype(); //don't make a new one everytime, make sure its stored
        match("keyword");
        match("prototype"); //can include check to make sure same as type
        match("(");
        while(!at(")")){
            ParameterDec newParam = parseParameterDec();
            parameters.add(newParam);
        }
        match(")");
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new ConstructorDec(type, parameters, statements);
    }

    private IfStatement parseIfStatement() throws UnexpectedMatchException {
        ArrayList<Statement> statements = new ArrayList<Statement>();
        match("if");
        match("(");
        Expression condition = parseExpression();
        match(")");
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new IfStatement(condition, statements);
    }

    private WhileStatement parseWhileStatement() throws UnexpectedMatchException {
        ArrayList<Statement> statements = new ArrayList<Statement>();
        match("while");
        match("(");
        Expression condition = parseExpression();
        match(")");
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new WhileStatement(condition, statements);
    }

    private ForStatement parseForStatement() throws UnexpectedMatchException {
        ArrayList<Statement> statements = new ArrayList<Statement>();
        match("for");
        match("(");
        Statement iterator = parseStatement();
        match(":");
        Expression condition = parseExpression();
        match(":");
        Statement iteration = parseStatement();
        match(")");
        match("{");
        whiteSpaceRemover();
        while(!at("}")){
            Statement statement = parseStatement();
            statements.add(statement);
            whiteSpaceRemover();
        }
        match("}");
        whiteSpaceRemover();
        return new ForStatement(iterator, condition, iteration, statements);
    }

    private ReturnStatement parseReturnStatement() throws UnexpectedMatchException {
        match("return");
        if(!at("\n")){
            Optional<Expression> expression = Optional.of(parseExpression());
            return new ReturnStatement(expression);
        } else {
            return new ReturnStatement(Optional.empty());
        }
    }

    private ContinueStatement parseContinueStatement() throws UnexpectedMatchException {
        match("continue");
        return new ContinueStatement();
    }

    private BreakStatement parseBreakStatement() throws UnexpectedMatchException {
        match("break");
        return new BreakStatement();
    }

    private ExpressionStatement parseExpressionStatement() throws UnexpectedMatchException {
        Expression expression = parseExpression();
        return new ExpressionStatement(expression);
    }

    private KeyValuePair parseKeyValuePair() throws UnexpectedMatchException {
        Expression key = parseExpression();
        match(":");
        Expression value = parseExpression();
        return new KeyValuePair(key, value);
    }

    private Expression parseExpression() throws UnexpectedMatchException {
        Expression left = parseExp1();
        while(at("or")){
            String operator = match("or").lexeme();
            Expression right = parseExp1();
            left = new BinaryExpression(left, operator, right);
        }
        return left;
    }

    private Expression parseExp1() throws UnexpectedMatchException {
        Expression left = parseExp2();
        while(at("and")){
            String operator = match("and").lexeme();
            Expression right = parseExp2();
            left = new BinaryExpression(left, operator, right);
        }
        return left;
    }

    private Expression parseExp2() throws UnexpectedMatchException {
        Expression left = parseExp3();
        while(at("==") || at("!=")){
            String operator = match().lexeme();
            Expression right = parseExp3();
            left = new BinaryExpression(left, operator, right);
        }
        return left;
    }

    private Expression parseExp3() throws UnexpectedMatchException {
        Expression left = parseExp4();
        while(at("<=") || at(">=") || at("<") || at(">")){
            String operator = match().lexeme();
            Expression right = parseExp4();
            left = new BinaryExpression(left, operator, right);
        }
        return left;
    }

    private Expression parseExp4() throws UnexpectedMatchException {
        Expression left = parseExp5();
        Expression expression = parseExp4Prime(left);
        return expression;
    }

    private Expression parseExp4Prime(Expression left) throws UnexpectedMatchException {
        while(at("+") || at("-")){
            String operator = match().lexeme();
            Expression right = parseExp5();
            left = parseExp4Prime(left);
            left = new BinaryExpression(left, operator, right);
        }
        return left;
    }

    private Expression parseExp5() throws UnexpectedMatchException {
        Expression left = parseExp6();
        Expression expression = parseExp5Prime(left);
        return expression;
    }

    private Expression parseExp5Prime(Expression left) throws UnexpectedMatchException {
        while(at("*") || at("/") || at("%")){
            String operator = match().lexeme();
            Expression right = parseExp6();
            left = parseExp5Prime(left);
            left = new BinaryExpression(left, operator, right);
        }
        return left;
    }

    private Expression parseExp6() throws UnexpectedMatchException {
        if(!(at("!") || at("-"))){
            Expression left = parseExp7();
            while(at("^")){
                String operator = match("^").lexeme();
                Expression right = parseExp6();
                left = new BinaryExpression(left, operator, right);
            }
            return left;
        } else {
            String operator = match().lexeme();
            Expression right = parseExp7();
            right = new UnaryExpression(operator, right);
            return right;
        }
    }

    private Expression parseExp7() throws UnexpectedMatchException {
        Expression left = parseExp8();
        Expression expression = parseExp7Prime(left);
        return expression;
    }

    private Expression parseExp7Prime(Expression left) throws UnexpectedMatchException {
        if(at("[")){
            match("[");
            Expression expression = parseExpression();
            match("]");
            left = parseExp7Prime(left);
            return new IndexExpression(left, expression);
        } else if(at("(")){
            match("(");
            ArrayList<Expression> arguments = new ArrayList<Expression>();
            while(!at(")")){
                Expression newExpression = parseExpression();
                arguments.add(newExpression);
                if(at(",")){
                    match(",");
                }
            }
            match(")");
            left = parseExp7Prime(left);
            return new CallExpression(left, arguments);
        } else if(at(".")){
            match(".");
            String identifier = match("id").lexeme();
            left = parseExp7Prime(left);
            return new AccessExpression(left, identifier);
        }
        return left;
    }

    private Expression parseExp8() throws UnexpectedMatchException {
        if(at("integer/rational")){
            String number = match().lexeme();
            if(number.contains(".")){
                Float result = Float.parseFloat(number);
                return new RationalLiteral(result);
            } else {
                Integer result = Integer.parseInt(number);
                return new IntegerLiteral(result);
            }
        } else if(at("true")){
            match("true");
            return new BooleanLiteral(true);
        } else if(at("false")){
            match("false");
            return new BooleanLiteral(false);
        } else if(at("string")){
            String result = match("string").lexeme().replaceAll("\"", "");
            return new StringLiteral(result);
        } else if(at("self")){
            match("self");
            return new SelfLiteral();
        } else if(at("any")){
            return new DoesNotExistLiteral(match("any").lexeme());
        } else if(at("none")){
            return new DoesNotExistLiteral(match("none").lexeme());
        } else if(at("prototype")){
            String prototype = match("prototype").lexeme();
            return new PrototypeLiteral(prototype);
        } else if(at("id")){
            return new IdentifierLiteral(match("id").lexeme());
        } else if(at("#")){
            match("#");
            String prototype = match("prototype").lexeme();
            match("#");
            if(at("||")){
                ArrayList<Expression> contents = new ArrayList<Expression>();
                match("||");
                while(!at("||")){
                    Expression newExpression = parseExpression();
                    contents.add(newExpression);
                    if(at(",")){
                        match(",");
                    }
                }
                match("||");
                return new ListLiteral(prototype, contents);
            } else if(at("<<")){
                ArrayList<KeyValuePair> contents = new ArrayList<KeyValuePair>();
                match("<<");
                while(!at(">>")){
                    KeyValuePair newKeyValue = parseKeyValuePair();
                    contents.add(newKeyValue);
                    if(at(",")){
                        match(",");
                    }
                }
                match(">>");
                return new MapLiteral(prototype, contents);
            }
        } else if(at("(")){
            match("(");
            Expression expression = parseExpression();
            match(")");
            return expression;
        }
        return null;
    }

    private Optional<PipelinesDec> parsePipelinesDec() throws UnexpectedMatchException {
        return null;
    }

    @Override
    public String toString(){
        return this.root.toString();
    }

    public static void main(String[] args){
        String varDecs = """

            Definitions {
                BOOL bob <== !true

                INT a <== 7+2-(-3+4)

                

                }

        """;

        String funcDecs = """

            Definitions {
                STR FUNC e ( STR f, STR x ) {
                    return f + \"boom\" + x
                }
                DNE FUNC consume ( DNE food ) {
                    return
                }
            }
        """;

        String protoDecs = """

            Definitions {
                PROTO G {
                    ATR STR h
                    G FUNC G( STR x ){
                        self.:: Hey whats goin on in here? ::h <== h
                    }
                    ATR STR FUNC getH(){
                    	return self.h
                    }
                }
            }
        """;

        String controlStatements = """
            Definitions {
                if(any::
                Hey look I blew up your conditional bozo
                ::!= any){
                	while(2 > 7){
                    	break
                    }
                }
                for(INT bobbel <== 0 : bobbel <= 20 : bobbel <++ 1){
                	continue
                }
            }
        """;

        String assignmentStatements = """

            Definitions {


                print(j[2])
                
                
            }
                """;

        String programFinal = """
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
            }
                """;
        
        Lexer croccy4 = new Lexer(programFinal);
        try {
            Parser chompy = new Parser(croccy4.tokens);
            System.out.println(chompy);
        } catch (Exception e){
            System.out.println(e.toString());
        }
        
    }

    public class UnexpectedMatchException extends Exception {
        UnexpectedMatchException(String e){
            super(e);
        }
    }

}
