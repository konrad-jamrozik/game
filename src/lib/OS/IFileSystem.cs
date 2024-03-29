﻿using System.Text.Json;

namespace Lib.OS;

public interface IFileSystem
{
    Dir CurrentDir { get; }
    bool DirectoryExists(string path);
    public void AppendAllText(string path, string contents);
    public Task WriteAllTextAsync(string path, string contents);
    public void WriteAllText(string path, string contents);
    public Task WriteAllLinesAsync(string path, IEnumerable<string> lines);
    public StreamWriter CreateText(string path);
    public string[] ReadAllLines(string path);
    Dir CreateDirectory(string path);
    string JoinPath(string? path1, string? path2);
    bool FileExists(string path);
    string CombinePath(string path1, string path2);
    string ReadAllText(string path);
    JsonElement ReadAllJson(string path);
    T ReadJsonInto<T>(string path);
    T ReadJsonInto<T>(string path, JsonSerializerOptions? options);
    T ReadJsonInto<T>(File file, JsonSerializerOptions? options);
    byte[] ReadAllBytes(string path);
    FileTree FileTree(string path);
    Dir? Parent(string path);
    string GetFullPath(string path);
    char DirectorySeparatorChar { get; }
    string EnvironmentNewLine { get; }
}