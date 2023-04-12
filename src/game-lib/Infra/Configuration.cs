using Lib.OS;

namespace UfoGameLib.Infra;

internal class Configuration
{
    internal readonly Dir SaveGameDir;

    internal readonly string SaveFileName;

    internal Configuration(IFileSystem fs)
    {
        // /src/game-lib-tests/bin/Debug/net7.0/
        // -->
        // /../../../../../
        SaveGameDir = new Dir(fs, "./../../../../../saves");
        SaveFileName = "savegame.txt";
    }
}