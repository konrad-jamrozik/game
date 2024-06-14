using UfoGameLib.Lib;

namespace UfoGameLib.Tests;

public class DeterministicRandomGen : RandomGen
{
    private readonly int _missionSiteCountdown;

    public DeterministicRandomGen(int missionSiteCountdown)
    {
        _missionSiteCountdown = missionSiteCountdown;
    }

    public override int RandomizeMissionSiteCountdown()
        => _missionSiteCountdown;
}