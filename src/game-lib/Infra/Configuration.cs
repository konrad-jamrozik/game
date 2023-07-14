using Lib.OS;
using File = Lib.OS.File;

namespace UfoGameLib.Infra;

public class Configuration
{
    internal readonly Dir SaveGameDir;


    internal readonly string SaveFileName;

    internal readonly string LogFileName;

    public readonly File SaveFile;

    public readonly File LogFile;


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
        LogFileName = "log.txt";
        SaveFile = new File(SaveGameDir, SaveFileName);
        LogFile = new File(SaveGameDir, LogFileName);
        // kja3 should have method here that returns handle to Lib.OS.File represented by SaveFileName
    }
}