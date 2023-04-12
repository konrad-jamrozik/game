using System.IO;
using System.Threading.Tasks;

namespace Lib.Primitives;

public interface IWritableToText
{
    Task WriteAsync(TextWriter textWriter);
}