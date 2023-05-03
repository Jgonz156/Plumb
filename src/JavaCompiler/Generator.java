package JavaCompiler;

import java.util.*;

import JavaCompiler.Core.*;
import JavaCompiler.Parser.UnexpectedMatchException;

public class Generator {
    private String output = "";
    private HashMap<String, String> opMap = new HashMap<String, String>();
    private String indent = "   ";
    private Integer indentLevel = 1;

    Generator(Program p) {
        opMap.put("<==", "=");
        opMap.put("<++", "+=");
        opMap.put("<--", "-=");
        opMap.put("<**", "*=");
        opMap.put("<//", "/=");
        opMap.put("<%%", "%=");
        opMap.put("+", "+");
        opMap.put("-", "-");
        opMap.put("*", "*");
        opMap.put("/", "/");
        opMap.put("%", "%");
        opMap.put("and", "&&");
        opMap.put("or", "||");
        opMap.put("==", "==");
        opMap.put("!=", "!=");
        opMap.put(">=", ">=");
        opMap.put("<=", "<=");
        opMap.put(">", ">");
        opMap.put("<", "<");
        opMap.put("^", "**");
        opMap.put("!", "!");
        opMap.put("not", "!");

        this.distribute(p);
    }
    private void indent(){
        indentLevel++;
    }

    private void dent(){
        output += indent.repeat(indentLevel);
    }

    private void dedent(){
        indentLevel--;
    }

    private String prototypeToClass(Prototype type){
        if(type instanceof ListPrototype){
            ListPrototype l = (ListPrototype) type;
            return "List<" + prototypeToClass(l.inner()) + ">";
        } else if(type instanceof MapPrototype){
            MapPrototype m = (MapPrototype) type;
            return "Map<String, " + prototypeToClass(m.inner()) + ">";
        } else {
            BasePrototype b = (BasePrototype) type;
            return switch (b.name()) {
                case "Integer" -> "Integer";
                case "Rational" -> "Float";
                case "String" -> "String";
                case "Boolean" -> "Boolean";
                case "Does Not Exist" -> "Object";
                default -> b.name();
            };
        }
        
    }

    public <T> void distribute(T node) {
        if(node == null) return;
        switch(node.getClass().getSimpleName()){
            case "Program" -> Program((Program) node);
            case "ImportDec" -> ImportDec((ImportDec) node);
            case "DefinitionsDec" -> DefinitionsDec((DefinitionsDec) node);
            case "VariableDec" -> VariableDec((VariableDec) node);
            case "Assignment" -> Assignment((Assignment) node);
            case "FunctionDec" -> FunctionDec((FunctionDec) node);
            case "ParameterDec" -> ParameterDec((ParameterDec) node);
            case "PrototypeDec" -> PrototypeDec((PrototypeDec) node);
            case "AttributeDec" -> AttributeDec((AttributeDec) node);
            case "MethodDec" -> MethodDec((MethodDec) node);
            case "ConstructorDec" -> ConstructorDec((ConstructorDec) node);
            case "IfStatement" -> IfStatement((IfStatement) node);
            case "WhileStatement" -> WhileStatement((WhileStatement) node);
            case "ForStatement" -> ForStatement((ForStatement) node);
            case "ReturnStatement" -> ReturnStatement((ReturnStatement) node);
            case "ContinueStatement" -> ContinueStatement((ContinueStatement) node);
            case "BreakStatement" -> BreakStatement((BreakStatement) node);
            case "ExpressionStatement" -> ExpressionStatement((ExpressionStatement) node);
            case "RationalLiteral" -> RationalLiteral((RationalLiteral) node);
            case "IntegerLiteral" -> IntegerLiteral((IntegerLiteral) node);
            case "BooleanLiteral" -> BooleanLiteral((BooleanLiteral) node);
            case "StringLiteral" -> StringLiteral((StringLiteral) node);
            case "SelfLiteral" -> SelfLiteral((SelfLiteral) node);
            case "DoesNotExistLiteral" -> DoesNotExistLiteral((DoesNotExistLiteral) node);
            case "PrototypeLiteral" -> PrototypeLiteral((PrototypeLiteral) node);
            case "IdentifierLiteral" -> IdentifierLiteral((IdentifierLiteral) node);
            case "ListLiteral" -> ListLiteral((ListLiteral) node);
            case "MapLiteral" -> MapLiteral((MapLiteral) node);
            case "KeyValuePair" -> KeyValuePair((KeyValuePair) node);
            case "BinaryExpression" -> BinaryExpression((BinaryExpression) node);
            case "UnaryExpression" -> UnaryExpression((UnaryExpression) node);
            case "IndexExpression" -> IndexExpression((IndexExpression) node);
            case "CallExpression" -> CallExpression((CallExpression) node);
            case "AccessExpression" -> AccessExpression((AccessExpression) node);
            default -> throw new IllegalArgumentException("Unsupported object type: " + node.getClass().getName());
        }
    }

    private void Program(Program p) {
        output += "package src;\njava.util.*;\n";
        p.imports().ifPresent(a -> a.forEach(i -> distribute(i)));
        output += "class Start {\n";
        indent();
        dent();
        output += "static{\n";
        indent();
        p.definition().ifPresent(d -> distribute(d));
        dedent();
        dent();
        output += "}\n";
        dedent();
        output += "public static void main(String[] args){\n";
        //p.pipeline().ifPresent(l -> distribute(l));
        output += "}\n}";
    }
    
    private void ImportDec(ImportDec i) {
        output += "import " + i.path().replaceAll("/", ".").replaceAll("\"", "") + ".*;\n";
    }

    private void DefinitionsDec(DefinitionsDec d) {
        d.statements().ifPresent(s -> s.forEach(i -> distribute(i)));
    }

    private void VariableDec(VariableDec v) {
        dent();
        output += prototypeToClass(v.type()) + " ";
        output += v.identifier() + " ";
        output += opMap.get(v.assignmentOperator()) + " ";
        distribute(v.expression());
        output += ";\n";
    }

    private void Assignment(Assignment a) {
        dent();
        output += a.identifier() + " ";
        output += opMap.get(a.assignmentOperator()) + " ";
        distribute(a.expression());
        output += ";\n";
    }

    private void FunctionDec(FunctionDec f) {
        dent();
        output += "private ";
        output += prototypeToClass(f.returnType()) + " ";
        output += f.identifier() + "(";
        for (var param: f.parameters()){
            distribute(param);
            output += ",";
        }
        output = output.substring(0, output.length() - 1);
        output += ") {\n";
        indent();
        f.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void ParameterDec(ParameterDec p) {
        output += prototypeToClass(p.type()) + " " + p.identifier();
    }

    private void PrototypeDec(PrototypeDec p) {
        dent();
        output += "class ";
        output += p.identifier() + " ";
        output += "{\n";
        indent();
        p.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void AttributeDec(AttributeDec a) {
        dent();
        output += prototypeToClass(a.type()) + " ";
        output += a.identifier() + " ";
        a.assignmentOperator().ifPresent(op -> output += opMap.get(op) + " ");
        a.expression().ifPresent(e -> distribute(e));
        output += ";\n";
    }

    private void MethodDec(MethodDec m) {
        dent();
        output += "private ";
        output += prototypeToClass(m.returnType()) + " ";
        output += m.identifier() + "(";
        for (var param: m.parameters()){
            distribute(param);
            output += ",";
        }
        output = output.substring(0, output.length() - 1);
        output += ") {\n";
        indent();
        m.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void ConstructorDec(ConstructorDec c) {
        dent();
        output += prototypeToClass(c.parent()) + "(";
        for (var param: c.parameters()){
            distribute(param);
            output += ",";
        }
        output = output.substring(0, output.length() - 1);
        output += ") {\n";
        indent();
        c.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void IfStatement(IfStatement i) {
        dent();
        output += "if(";
        distribute(i.condition());
        output += ") {\n";
        indent();
        i.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void WhileStatement(WhileStatement w) {
        dent();
        output += "while(";
        distribute(w.condition());
        output += ") {\n";
        indent();
        w.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void ForStatement(ForStatement f) {
        dent();
        output += "for(";
        dedent();
        distribute(f.assignment());
        output = output.substring(0, output.length() - 1);
        distribute(f.condition());
        output = output.substring(0, output.length() - 1);
        output += ";";
        distribute(f.iteration());
        output = output.substring(0, output.length() - 1);
        output += ") {\n";
        indent();
        f.statements().forEach(s -> distribute(s));
        dedent();
        dent();
        output += "}\n";
    }

    private void ReturnStatement(ReturnStatement r) {
        dent();
        output += "return ";
        r.expression().ifPresent(e -> distribute(e));
        output += ";\n";
    }

    private void ContinueStatement(ContinueStatement c) {
        dent();
        output += "continue;\n";
    }

    private void BreakStatement(BreakStatement b) {
        dent();
        output += "break;\n";
    }

    private void ExpressionStatement(ExpressionStatement e) {
        dent();
        distribute(e.expression());
        output += ";\n";
    }

    private void RationalLiteral(RationalLiteral r) {
        output += r.value().toString().contains(".")? r.value() : r.value() + ".0";
    }

    private void IntegerLiteral(IntegerLiteral i) {
        output += i.value();
    }

    private void BooleanLiteral(BooleanLiteral b) {
        output += b.value();
    }

    private void StringLiteral(StringLiteral s) {
        output += "\"" + s.value() + "\"";
    }

    private void SelfLiteral(SelfLiteral s) {
        output += "this";
    }

    private void DoesNotExistLiteral(DoesNotExistLiteral d) {
        output += "null";
    }

    private void PrototypeLiteral(PrototypeLiteral p) {
        output += "new " + p.value();
    }

    private void IdentifierLiteral(IdentifierLiteral i) {
        output += i.value();
    }

    private void ListLiteral(ListLiteral l) {
        output += "List.of(new ";
        output += l.type() + "[]{";
        for(var item: l.contents()){
            distribute(item);
            output += ",";
        }
        output = output.substring(0, output.length() - 1);
        output += "})";
    }

    private void MapLiteral(MapLiteral m) {
        output += "Map.ofEntries(";
        for(var item: m.contents()){
            output += "new AbstractMap.SimpleEntry<String,";
            output += m.type() + ">(";
            distribute(item);
            output += ")";
            output += ",";
        }
        output = output.substring(0, output.length() - 1);
        output += ")";
    }

    private void KeyValuePair(KeyValuePair k) {
        distribute(k.key());
        output += ",";
        distribute(k.value());
    }

    private void BinaryExpression(BinaryExpression b) {
        if(b.operator() == "^"){
            output += "Math.pow(";
            distribute(b.left());
            output += ",";
            distribute(b.right());
            output += ")";
            return;
        } else {
            distribute(b.left());
            output += " " + opMap.get(b.operator()) + " ";
            distribute(b.right());
        }
    }

    private void UnaryExpression(UnaryExpression u) {
        output += opMap.get(u.operator());
        distribute(u.right());
    }

    private void IndexExpression(IndexExpression i) {
        distribute(i.object());
        output += "[";
        distribute(i.index());
        output += "]";
    }

    private void CallExpression(CallExpression c) {
        distribute(c.function());
        output += "(";
        for(var arg: c.arguments()){
            distribute(arg);
            output += ",";
        }
        output = output.substring(0, output.length() - 1);
        output += ")";
    }

    private void AccessExpression(AccessExpression a) {
        distribute(a.object());
        output += ".";
        a.attribute();
    }

    @Override
    public String toString(){
        return this.output;
    }

    public static void main(String[] args) throws UnexpectedMatchException {
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
        
        Parser chompy = new Parser(croccy.tokens);

        Generator Jergen = new Generator(chompy.root);

        System.out.println(Jergen.toString());
    }
}
