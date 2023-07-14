using Lib.OS;

namespace UfoGameLib.Infra;

public class Configuration
{
    internal readonly Dir SaveGameDir;

    internal readonly string SaveFileName;

    public Configuration(IFileSystem fs)
    {
        // Given expected starting path:
        //   [repo_root]/artifacts/bin/game-lib/debug/.
        //
        // When this relative path is applied:
        //   ./../../../../saves
        // 
        // Then this is the expected resulting path:
        //   [repo_root]/saves/
        //
        SaveGameDir = new Dir(fs, "./../../../../saves");
        SaveFileName = "savegame.txt";
        // kja3 should have method here that returns handle to Lib.OS.File represented by SaveFileName
    }
}