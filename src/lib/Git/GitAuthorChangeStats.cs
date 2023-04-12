namespace Lib.Git;

public record GitAuthorChangeStats(
    string Author,
    int FilesChanged,
    int Insertions,
    int Deletions) { }