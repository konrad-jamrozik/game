using Lib.OS;

namespace Lib.Configuration;

public interface IConfiguration
{
    IFileSystem FileSystem();
}