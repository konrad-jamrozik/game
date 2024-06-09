using System.Text.Json.Serialization;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public class ApplyPlayerActionRequestBody
{
    public readonly PlayerActionPayload PlayerActionPayload;
    public readonly GameSessionTurn GameSessionTurn;

    [JsonConstructor]
    public ApplyPlayerActionRequestBody(PlayerActionPayload playerActionPayload, GameSessionTurn gameSessionTurn)
    {
        PlayerActionPayload = playerActionPayload;
        GameSessionTurn = gameSessionTurn;
    }
}