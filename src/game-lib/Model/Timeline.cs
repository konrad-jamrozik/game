using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

public class Timeline
{
    public const int InitialTurn = 1;
    public int CurrentTurn;

    public Timeline()
    {
        CurrentTurn = InitialTurn;
    }
    
    [JsonConstructor]
    public Timeline(int currentTurn)
    {
        CurrentTurn = currentTurn;
    }
}