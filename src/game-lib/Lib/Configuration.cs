using Lib.OS;
using File = Lib.OS.File;

namespace UfoGameLib.Lib;

public class Configuration
{
    public readonly File SaveFile;

    public readonly File LogFile;

    public readonly File TurnReportCsvFile;

    public readonly File AgentReportCsvFile;

    public readonly File MissionSiteReportCsvFile;

    public readonly bool IncludeCallerTypeNameInLog = false;

    public readonly bool IncludeCallerMemberNameInLog = false;

    public Configuration(IFileSystem fs)
    {
        // Given expected starting path on .NET 8, using the Simplified Output Paths [1]
        //   [repo_root]/artifacts/bin/game-lib/debug/.
        //
        // When this relative path is applied:
        //   ./../../../../saves
        // 
        // Then this is the expected resulting path:
        //   [repo_root]/saves/
        //
        // [1] https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8#simplified-output-paths
        var saveFileDir = new Dir(fs, "./../../../../saves");
        SaveFile = new File(saveFileDir, "savegame.json");
        LogFile = new File(saveFileDir, "log.txt");
        TurnReportCsvFile = new File(saveFileDir, "turns_report.csv");
        AgentReportCsvFile = new File(saveFileDir, "agents_report.csv");
        MissionSiteReportCsvFile = new File(saveFileDir, "mission_sites_report.csv");
        // kja should have method here that returns handle to Lib.OS.File represented by SaveFileName
    }
}