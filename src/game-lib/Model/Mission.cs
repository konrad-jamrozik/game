using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public enum State
    {
        Active,
        Successful,
        Failed
    }

    public MissionSite Site;
    public bool IsActive; // kja to be deleted, subsumed by CurrentState
    public State CurrentState;

    public Mission(int id, MissionSite site)
    {
        Debug.Assert(site.IsActive);

        Id = id;
        Site = site;
        // MissionSite is no longer active because this mission was launched on it.
        Site.IsActive = false;
        // This mission just got constructed so it is active until it gets evaluated
        // on time advancement.
        IsActive = true;
        CurrentState = State.Active;
    }

    [JsonConstructor]
    public Mission(int id, bool isActive, State currentState, MissionSite site)
    {
        Id = id;
        Site = site;
        IsActive = isActive;
        CurrentState = currentState;
    }

    public int Id { get; }
}
