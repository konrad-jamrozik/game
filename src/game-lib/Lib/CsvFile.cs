using Lib.Data;
using Lib.Primitives;
using File = Lib.OS.File;

namespace UfoGameLib.Lib;

public class CsvFile
{
    private readonly File _file;
    private readonly TabularData _data;

    public CsvFile(File file, TabularData data)
    {
        _file = file;
        _data = data;
    }

    public void Write()
    {
        string headerLine = string.Join(",", _data.HeaderRow);
        List<string> rowLines = _data.Rows.Select(row => string.Join(",", row)).ToList();
        List<string> allLines = headerLine.WrapInList().Concat(rowLines).ToList();
        _file.FileSystem.WriteAllLinesAsync(_file.FullPath, allLines);
    }
}