namespace Lib.OS;

public record File(IFileSystem FileSystem, string Path)
{
    public File(Dir dir, string fileName) : this(dir.FileSystem, dir.JoinPath(fileName))
    {
    }

    public string FullPath => FileSystem.GetFullPath(Path);

    public string Name => System.IO.Path.GetFileName(Path);

    public void AppendAllText(string contents)
        => FileSystem.AppendAllText(Path, contents);

    public void WriteAllText(string contents)
        => FileSystem.WriteAllText(Path, contents);
}