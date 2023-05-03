package JavaCompiler;

import java.util.ArrayList;
import java.util.Optional;

public class Core {

    /* Interface Section */

    interface Statement {}

    interface Expression {}

    interface Prototype {}

    /* Type Section */

    public record MapPrototype(Prototype inner) implements Prototype {}

    public record ListPrototype(Prototype inner) implements Prototype {}

    public record BasePrototype(String name) implements Prototype {
        static BasePrototype INT = new BasePrototype("Integer");
        static BasePrototype RAT = new BasePrototype("Rational");
        static BasePrototype STR = new BasePrototype("String");
        static BasePrototype BOOL = new BasePrototype("Boolean");
        static BasePrototype DNE = new BasePrototype("Does Not Exist");
    }

    /* Statement Section */

    public record Token(String category, String lexeme, Integer line, Integer column) {
        @Override
        public String toString(){
            return this.lexeme;
        }
    }

    public record Program(Optional<ArrayList<ImportDec>> imports, Optional<DefinitionsDec> definition, Optional<PipelinesDec> pipeline) {}
    
    public record ImportDec(String path) {}

    public record DefinitionsDec(Optional<ArrayList<Statement>> statements) {}

    public record VariableDec(Prototype type, String identifier, String assignmentOperator, Expression expression) implements Statement {}

    public record Assignment(Boolean self, String identifier, String assignmentOperator, Expression expression) implements Statement {}

    public record FunctionDec(Prototype returnType, String identifier, ArrayList<ParameterDec> parameters, ArrayList<Statement> statements) implements Statement {}

    public record ParameterDec(Prototype type, String identifier) {}

    public record PrototypeDec(Prototype type, String identifier, ArrayList<Statement> statements) implements Statement {}

    public record AttributeDec(Prototype type, String identifier, Optional<String> assignmentOperator, Optional<Expression> expression) implements Statement {}

    public record MethodDec(Prototype returnType, String identifier, ArrayList<ParameterDec> parameters, ArrayList<Statement> statements) implements Statement {}

    public record ConstructorDec(Prototype parent, ArrayList<ParameterDec> parameters, ArrayList<Statement> statements) implements Statement {}

    public record IfStatement(Expression condition, ArrayList<Statement> statements) implements Statement {}

    public record WhileStatement(Expression condition, ArrayList<Statement> statements) implements Statement {}

    public record ForStatement(Statement assignment, Expression condition, Statement iteration, ArrayList<Statement> statements) implements Statement {}

    public record ReturnStatement(Optional<Expression> expression) implements Statement {}

    public record ContinueStatement() implements Statement {}

    public record BreakStatement() implements Statement {}

    public record ExpressionStatement(Expression expression) implements Statement {}

    /* Expression Section */

    public record RationalLiteral(Float value) implements Expression {}

    public record IntegerLiteral(Integer value) implements Expression {}

    public record BooleanLiteral(Boolean value) implements Expression {}

    public record StringLiteral(String value) implements Expression {}

    public record SelfLiteral() implements Expression {}

    public record DoesNotExistLiteral(String value) implements Expression {}

    public record PrototypeLiteral(String value) implements Expression {}

    public record IdentifierLiteral(String value) implements Expression {}

    public record ListLiteral(String type, ArrayList<Expression> contents) implements Expression {}

    public record MapLiteral(String type, ArrayList<KeyValuePair> contents) implements Expression {}

    public record KeyValuePair(Expression key, Expression value) implements Expression {}

    public record BinaryExpression(Expression left, String operator, Expression right) implements Expression {}

    public record UnaryExpression(String operator, Expression right) implements Expression {}

    public record IndexExpression(Expression object, Expression index) implements Expression {}

    public record CallExpression(Expression function, ArrayList<Expression> arguments) implements Expression {}

    public record AccessExpression(Expression object, String attribute) implements Expression {}

    //Make an Thread Pool for this in future
    public record PipelinesDec(ArrayList<PipeExpression> pipes) {}

    public record PipeExpression(Expression left, String operator, PipeExpression right) {}

}
