namespace UfoGameLib.Infra;

public class RandomGen
{
    private readonly Random _random;

    public RandomGen(Random random)
    {
        _random = random;
    }

    public int Roll100() => _random.Next(100) + 1;

    public T PickOneAtRandom<T>(List<T> items)
    {
        int pickedIndex = _random.Next(items.Count);
        return items[pickedIndex];
    }

    public TValue PickOneAtRandom<TKey, TValue>(IDictionary<TKey, TValue> dict)
    {
        List<TKey> keyList = dict.Keys.ToList();
        TKey pickedKey = PickOneAtRandom(keyList);
        return dict[pickedKey];
    }
}