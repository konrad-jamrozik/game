namespace UfoGameLib.Lib;

public class IdGen
{
    protected int NextId;

    public int Generate => NextId++;

    public int Value => NextId;
}