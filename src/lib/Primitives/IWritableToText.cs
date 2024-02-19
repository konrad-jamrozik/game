namespace Lib.Primitives;

public interface IWritableToText
{
    Task WriteAsync(TextWriter textWriter);
}