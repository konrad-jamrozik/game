using UfoGameLib.Infra;

namespace UfoGameLib.Controller;

public abstract class PlayerAction
{
    public abstract void Apply(GameState state);
}