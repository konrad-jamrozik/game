using Lib.OS;
using File = Lib.OS.File;

namespace UfoGameLib.Lib;

public class Configuration
{
    public readonly File SaveFile;

    public readonly File LogFile;

    public readonly bool IncludeCallerTypeNameInLog = false;

    public readonly bool IncludeCallerMemberNameInLog = false;

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
        var saveFileDir = new Dir(fs, "./../../../../saves");
        SaveFile = new File(saveFileDir, "savegame.txt");
        LogFile = new File(saveFileDir, "log.txt");
        // kja3 should have method here that returns handle to Lib.OS.File represented by SaveFileName
    }
}