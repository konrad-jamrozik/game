using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UfoGameLib.Events;

internal class GameEvent
{
    public readonly int Turn;
    public readonly string Description;

    public GameEvent(int turn, string description)
    {
        Turn = turn;
        Description = description;
    }

    public override string ToString()
    {
        return $"Turn {Turn}: {Description}";
    }
}