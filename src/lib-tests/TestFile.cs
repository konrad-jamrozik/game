using System;
using System.Runtime.CompilerServices;
using Lib.OS;
using Lib.Primitives;

namespace Lib.Tests;

public record TestFile(
    Dir Dir,
    [CallerMemberName] string? CallerMemberName = default)
{
    public string[] Write(IWritableToText target)
    {
        using (var fileWriter = Dir.CreateText(FileName))
        {
            target.WriteAsync(fileWriter).Wait();
        }
        Console.Out.WriteLine($"Wrote to {Dir.JoinPath(FileName)}");

        return Dir.ReadAllLines(FileName);
    }

    private string FileName => CallerMemberName + ".txt";
}