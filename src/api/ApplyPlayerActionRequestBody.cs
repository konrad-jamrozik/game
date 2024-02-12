using System.Text.Json.Serialization;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public class ApplyPlayerActionRequestBody
{
    public readonly PlayerActionPayload PlayerAction;
    public readonly GameState GameState;

    [JsonConstructor]
    public ApplyPlayerActionRequestBody(PlayerActionPayload playerAction, GameState gameState)
    {
        GameState = gameState;
        PlayerAction = playerAction;
    }
}