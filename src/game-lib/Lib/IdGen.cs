using Lib.Contracts;
using Lib.Json;

namespace UfoGameLib.Lib;

public class IdGen
{
    protected int NextId;

    public int Generate => NextId++;

    public int Value => NextId;

    public static void AssertConsecutiveIds<T>(List<T> instances, int? expectedFirstId = null) where T : IIdentifiable
    {
        if (instances.Any())
        {
            int firstId = instances[0].Id;
            if (expectedFirstId != null)
                Contract.Assert(firstId == expectedFirstId);
            for (int i = 0; i < instances.Count; i++)
            {
                int expectedId = firstId + i;
                Contract.Assert(
                    instances[i].Id == expectedId,
                    $"Expected consecutive ID of {expectedId} but got {instances[i].Id}.");
            }
        }
    }
}
