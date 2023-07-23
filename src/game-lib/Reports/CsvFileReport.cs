using Lib.Data;
using UfoGameLib.Lib;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public abstract class CsvFileReport
{
    protected void SaveToCsvFile(ILog log, File csvFile, TabularData data, string dataDescription)
    {
        new CsvFile(csvFile, data).Write();
        log.Info($"Saved {dataDescription} data as .csv report to {csvFile.FullPath}");
    }
}