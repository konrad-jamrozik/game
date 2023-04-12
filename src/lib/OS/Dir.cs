using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Lib.OS;

public record Dir(IFileSystem FileSystem, string Path)
{
    public bool Exists() => FileSystem.DirectoryExists(Path);

    public Dir CreateDirIfNotExists() => !Exists() ? CreateDir() : this;

    public Dir CreateDir() => FileSystem.CreateDirectory(Path);

    public bool FileExists(string fileName) => FileSystem.FileExists(JoinPath(fileName));

    public string JoinPath(string fileName) => FileSystem.JoinPath(Path, fileName);

    public string GetFullPath(string path) => FileSystem.GetFullPath(path);

    public string ReadAllText(string fileName) => FileSystem.ReadAllText(JoinPath(fileName));

    public string[] ReadAllLines(string fileName)
        => FileSystem.ReadAllLines(JoinPath(fileName));

    public async Task<string> WriteAllTextAsync(string fileName, string contents)
    {
        string filePath = JoinPath(fileName);
        await FileSystem.WriteAllTextAsync(filePath, contents);
        return filePath;
    }

    public string WriteAllText(string fileName, string contents)
    {
        string filePath = GetFullPath(JoinPath(fileName));
        FileSystem.WriteAllText(filePath, contents);
        return filePath;
    }

    public StreamWriter CreateText(string fileName)
        => FileSystem.CreateText(JoinPath(fileName));

    public Dir? Parent => FileSystem.Parent(Path);

    public List<File> GetFiles(string filterRegexPattern)
    {
        var regex = new Regex(filterRegexPattern);
        IEnumerable<string> filePaths = Directory.EnumerateFiles(Path);
        return filePaths
            .Where(path => regex.IsMatch(path))
            .Select(path => new File(FileSystem, path))
            .ToList();
    }
}