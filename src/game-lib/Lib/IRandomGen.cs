namespace UfoGameLib.Lib;

public interface IRandomGen
{
    int Roll1To(int n);
    int Roll0To(int n);
    int Roll(int min, int max);
    int Roll((int min, int max) range);
    int Roll(int @base, int min, int max);
    public double RollDouble(double min, double max);
    int Roll(Range range);
    T Pick<T>(List<T> items);
    List<T> Pick<T>(List<T> items, int count);
    TValue Pick<TKey, TValue>(IDictionary<TKey, TValue> dict);
    int RandomizeMissionSiteCountdown();
    bool FlipCoin();

    public (int result, double variationRoll) RollVariationAndRound(double baseValue, (double min, double max) range);

    public (double result, double variationRoll) RollVariation(double baseValue, (double min, double max) range);

    public (double result, double variationRoll) RollVariation(double baseValue, double min, double max);

    


    (int result, float variationRoll) RollVariationInt(int baseValue, (int min, int max) range, int precision);

    (int result, float variationRoll) RollVariationInt(int baseValue, int min, int max, int precision);

}