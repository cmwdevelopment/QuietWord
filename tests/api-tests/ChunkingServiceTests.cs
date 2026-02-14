using QuietWord.Api.Contracts;
using QuietWord.Api.Domain;
using QuietWord.Api.Services;

namespace QuietWord.Api.Tests;

public class ChunkingServiceTests
{
    [Fact]
    public void JohnChunking_IsDeterministic()
    {
        var service = new ChunkingService();
        var verses = Enumerable.Range(1, 11)
            .Select(i => new VerseDto($"John 1:{i}", $"Verse {i}", 1, i))
            .ToArray();

        var first = service.Chunk(ReadingSection.John, verses);
        var second = service.Chunk(ReadingSection.John, verses);

        Assert.Equal(first.Count, second.Count);
        Assert.Equal(first.Select(x => x.Text), second.Select(x => x.Text));
        Assert.All(first, chunk => Assert.InRange(chunk.VerseRefs.Length, 1, 3));
    }

    [Fact]
    public void PsalmChunking_RespectsBounds()
    {
        var service = new ChunkingService();
        var verses = Enumerable.Range(1, 20)
            .Select(i => new VerseDto($"Psalm 23:{i}", $"Verse {i}", 23, i))
            .ToArray();

        var chunks = service.Chunk(ReadingSection.Psalm, verses);

        Assert.NotEmpty(chunks);
        Assert.All(chunks, chunk => Assert.InRange(chunk.VerseRefs.Length, 2, 4));
        Assert.Equal(20, chunks.Sum(x => x.VerseRefs.Length));
    }
}
