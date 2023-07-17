using UfoGameLib.Infra;

namespace UfoGameLib.Controller;

public abstract class PlayerAction
{
    // This must be called only from PlayerActions. This applies also to derived classes.
    public abstract void Apply(GameState state);
}