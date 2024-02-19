using Lib.Data;

namespace Lib.OS;

public record FilePathTrie(IEnumerable<string> FilePaths) : TrieFromPaths(
    FilePaths, FileSystem.SplitPath)
{ }