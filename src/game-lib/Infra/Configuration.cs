using Lib.OS;

namespace UfoGameLib.Infra;

internal class Configuration
{
    internal readonly Dir SaveGameDir;

    internal readonly string SaveFileName;

    internal Configuration(IFileSystem fs)
    {
        // [repo_root]/.artifacts/bin/game-lib-tests/debug/.
        // -->
        // [repo_root]/../../../../saves
        // -->
        // [repo_root]/saves/
        SaveGameDir = new Dir(fs, "./../../../../saves");
        SaveFileName = "savegame.txt";
        // kja should have method here that returns handle to Lib.OS.File represented by SaveFileName
    }
}