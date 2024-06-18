using Lib.Contracts;
using Lib.Json;

namespace UfoGameLib.Lib;

public class IdGen
{
    protected int NextId;

    public int Generate => NextId++;

    public int Value => NextId;

    public static void AssertConsecutiveIds<T>(List<T> instances) where T: IIdentifiable
    {
        if (instances.Any())
        {
            int firstId = instances[0].Id;
            for (int i = 0; i < instances.Count; i++)
            {
                int expectedId = firstId + i;
                Contract.Assert(
                    instances[i].Id == expectedId,
                    $"Instance with id {instances[i].Id} is not equal to expected {expectedId}.");
            }
        }
    }
}