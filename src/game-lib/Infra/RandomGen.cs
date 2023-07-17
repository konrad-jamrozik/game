namespace UfoGameLib.Infra;

public class RandomGen
{
    private readonly Random _random;

    public RandomGen(Random random)
    {
        _random = random;
    }

    public int Roll1To(int n) => _random.Next(n) + 1;

    public int Roll0To(int n) => _random.Next(n+1);

    public int Roll(int min, int max) => min + Roll0To(max - min);

    // ReSharper disable once MemberCanBePrivate.Global
    public T Pick<T>(List<T> items)
        => items.RandomSubset(1, _random).Single();

    public List<T> Pick<T>(List<T> items, int count)
        => items.RandomSubset(count, _random).ToList();

    public TValue Pick<TKey, TValue>(IDictionary<TKey, TValue> dict)
    {
        List<TKey> keyList = dict.Keys.ToList();
        TKey pickedKey = Pick(keyList);
        return dict[pickedKey];
    }
}