using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

public class Timeline
{
    public const int InitialTurn = 1;
    public int CurrentTurn;

    [JsonConstructor]
    public Timeline(int currentTurn)
    {
        CurrentTurn = currentTurn;
    }
}