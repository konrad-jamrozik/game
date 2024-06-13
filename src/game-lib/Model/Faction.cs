using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

// kja integrate Faction class with the rest of codebase
public class Faction : IIdentifiable
{
    public int Id { get; }
    public readonly string Name;
    public readonly int Power;
    public readonly int PowerIncrease;
    public readonly int PowerAcceleration;
    public readonly int IntelInvested;

    [JsonConstructor]
    public Faction(int id, string name, int power, int powerIncrease, int powerAcceleration, int intelInvested)
    {
        Id = id;
        Name = name;
        Power = power;
        PowerIncrease = powerIncrease;
        PowerAcceleration = powerAcceleration;
        IntelInvested = intelInvested;
    }

    public Faction DeepClone()
    {
        return new Faction(Id, Name, Power, PowerIncrease, PowerAcceleration, IntelInvested);
    }
}