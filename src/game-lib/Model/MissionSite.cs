using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public const int BaseMissionSiteDifficulty = 30;
    public readonly int Difficulty;
    public bool IsActive;

    [JsonConstructor]
    public MissionSite(int id, int difficulty)
    {
        Id = id;
        IsActive = true;
        Difficulty = difficulty;
    }

    public int Id { get; }

    [JsonIgnore]
    public int RequiredSurvivingAgentsForSuccess
    {
        get
        {
            int result = 1 + (Difficulty - BaseMissionSiteDifficulty) / 30;
            Debug.Assert(result >= 1);
            return result;
        }
    }
}