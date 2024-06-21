namespace UfoGameLib.Lib;

public interface IRandomGen
{
    int Roll1To(int n);
    int Roll0To(int n);
    int Roll(int min, int max);
    int Roll((int min, int max) range);
    float RollFloat(float min, float max);
    int Roll(Range range);
    T Pick<T>(List<T> items);
    List<T> Pick<T>(List<T> items, int count);
    TValue Pick<TKey, TValue>(IDictionary<TKey, TValue> dict);
    int RandomizeMissionSiteCountdown();
    bool FlipCoin();
    
}