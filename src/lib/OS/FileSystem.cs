using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Lib.Contracts;
using Lib.Json;

namespace Lib.OS;

public class FileSystem : IFileSystem
{
    public static Dir? Parent(IFileSystem fs, string path)
    {
        Contract.Assert(!string.IsNullOrWhiteSpace(path), path);
        var parentDirInfo = new DirectoryInfo(path).Parent;
        return parentDirInfo != null ? new Dir(fs, parentDirInfo.FullName) : null;
    }

    public static IEnumerable<string> SplitPath(string path) => path.Split(System.IO.Path.DirectorySeparatorChar);

    public static string Path(IEnumerable<string> segments)
        => string.Join(System.IO.Path.DirectorySeparatorChar, segments);

    public Dir CurrentDir => new (this, Directory.GetCurrentDirectory());

    public bool DirectoryExists(string path) => Directory.Exists(path);

    public Task WriteAllTextAsync(string path, string contents) 
        => System.IO.File.WriteAllTextAsync(path, contents);

    public void AppendAllText(string path, string contents) 
        => System.IO.File.AppendAllText(path, contents);

    public void WriteAllText(string path, string contents) 
        => System.IO.File.WriteAllText(path, contents);

    public Task WriteAllLinesAsync(string path, IEnumerable<string> lines)
        => System.IO.File.WriteAllLinesAsync(path, lines);

    public StreamWriter CreateText(string path)
        => System.IO.File.CreateText(path);

    public string[] ReadAllLines(string path)
        => System.IO.File.ReadAllLines(path);

    public Dir CreateDirectory(string path)
    {
        var directoryInfo = Directory.CreateDirectory(path);
        return new Dir(this, directoryInfo.FullName);
    }

    public string JoinPath(string? path1, string? path2) => System.IO.Path.Join(path1, path2);

    public string GetFullPath(string path)
        => System.IO.Path.GetFullPath(path);

    public bool FileExists(string path) => System.IO.File.Exists(path);

    public string CombinePath(string path1, string path2) => System.IO.Path.Combine(path1, path2);

    public string ReadAllText(string path) => System.IO.File.ReadAllText(path);

    public byte[] ReadAllBytes(string path) => System.IO.File.ReadAllBytes(path);

    public JsonElement ReadAllJson(string path) => ReadAllBytes(path).FromJsonTo<JsonElement>();

    public T FromJsonTo<T>(string path)
    {
        throw new System.NotImplementedException();
    }

    public T FromJsonTo<T>(string path, JsonSerializerOptions? options) 
        => ReadAllBytes(path).FromJsonTo<T>(options);

    public T FromJsonTo<T>(File file, JsonSerializerOptions? options)
        => FromJsonTo<T>(file.FullPath, options);

    public FileTree FileTree(string path) => new FileTree(this, path);

    public Dir? Parent(string path) => Parent(this, path);

}