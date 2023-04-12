using System;

namespace Lib.Primitives;

public interface ITimeline
{
    DateTime UtcNow { get; }
}