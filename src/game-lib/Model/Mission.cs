using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public enum State
    {
        Active,
        Success,
        Failed
    }

    public MissionSite Site;
    public State CurrentState;

    public Mission(int id, MissionSite site) : this(
        id, 
        // This mission just got constructed so it is active until it gets evaluated
        // on time advancement.
        State.Active, 
        site)
    {
        Debug.Assert(site.IsActive);
        // MissionSite is no longer active because this mission was launched on it.
        Site.IsActive = false;
    }

    [JsonConstructor]
    public Mission(int id, State currentState, MissionSite site)
    {
        Id = id;
        Site = site;
        CurrentState = currentState;
    }

    [JsonIgnore]
    public bool IsActive => CurrentState == State.Active;

    public int Id { get; }
}