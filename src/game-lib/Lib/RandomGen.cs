using Lib.Contracts;
using MoreLinq;
using UfoGameLib.Model;

namespace UfoGameLib.Lib;

// Note: currently upon save/load the random gets re-randomized.
// To fix that, the Save file should include a seed used to recreate upon load.

public class RandomGen : IRandomGen
{
    private readonly Random _random;

    public RandomGen(Random? random = null)
    {
        _random = random ?? new Random();
    }

    public int Roll1To(int n)
    {
        Contract.Assert(n >= 1);
        return _random.Next(n) + 1;
    }

    public int Roll0To(int n)
    {
        Contract.Assert(n >= 0);
        return _random.Next(n + 1);
    }

    public int Roll(int min, int max)
    {
        Contract.Assert(min <= max);
        return min + Roll0To(max - min);
    }

    public int Roll((int min, int max) range)
    {
        return Roll(range.min, range.max);
    }

    public int Roll(int @base, int min, int max)
    {
        return @base + Roll(min, max);
    }

    public double RollDouble(double min, double max)
    {
        Contract.Assert(min <= max);
        int intMin = (int)(min * 10000);
        int intMax = (int)(max * 10000);
        int intRoll = Roll(intMin, intMax);
        return intRoll / 10000d;
    }

    public int Roll(Range range)
    {
        return Roll(range.Start.Value, range.End.Value);
    }

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

    public virtual int RandomizeMissionSiteCountdown()
        => Roll(Ruleset.FactionMissionSiteCountdownRange);

    public bool FlipCoin() => _random.Next(2) == 1;

    public (int result, float variationRoll) RollVariationInt(int baseValue, (int min, int max) range, int precision)
        => RollVariationInt(baseValue, range.min, range.max, precision);

    public (int result, float variationRoll) RollVariationInt(int baseValue, int min, int max, int precision)
    {
        // e.g.       -15 = Roll(-30, 30)
        int variationRoll = Roll(min, max);
        // e.g.   85 =       100 + (-15)
        int modifier = precision + variationRoll;
        // e.g. 42 =        50 *       85 / 100
        int result = baseValue * modifier / precision;
        return (result, variationRoll: variationRoll / (float)precision);
    }

    public (int result, double variationRoll) RollVariationAndRound(double baseValue, (double min, double max) range)
    {
        (double result, double variationRoll) = RollVariation(baseValue, range);
        return (result: (int)Math.Round(result), variationRoll);
    }

    public (double result, double variationRoll) RollVariation(double baseValue, (double min, double max) range)
        => RollVariation(baseValue, range.min, range.max);

    public (double result, double variationRoll) RollVariation(double baseValue, double min, double max)
    {
        double variationRoll = RollDouble(min, max);
        double modifier = 1 + variationRoll;
        double result = baseValue * modifier;
        return (result, variationRoll);
    }
} 
