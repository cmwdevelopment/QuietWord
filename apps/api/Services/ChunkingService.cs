using QuietWord.Api.Contracts;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Services;

public interface IChunkingService
{
    IReadOnlyList<PassageChunkDto> Chunk(ReadingSection section, IReadOnlyList<VerseDto> verses);
}

public sealed class ChunkingService : IChunkingService
{
    public IReadOnlyList<PassageChunkDto> Chunk(ReadingSection section, IReadOnlyList<VerseDto> verses)
    {
        if (verses.Count == 0)
        {
            return Array.Empty<PassageChunkDto>();
        }

        var size = DetermineChunkSize(section, verses.Count);
        var result = new List<PassageChunkDto>();

        var chunkIndex = 0;
        for (var i = 0; i < verses.Count; i += size)
        {
            var segment = verses.Skip(i).Take(size).ToArray();
            result.Add(new PassageChunkDto(
                chunkIndex,
                segment.Select(x => x.Ref).ToArray(),
                string.Join(" ", segment.Select(x => x.Text).Where(x => !string.IsNullOrWhiteSpace(x)))));
            chunkIndex++;
        }

        return result;
    }

    private static int DetermineChunkSize(ReadingSection section, int verseCount)
    {
        if (section == ReadingSection.Psalm)
        {
            if (verseCount <= 8) return 2;
            if (verseCount <= 16) return 3;
            return 4;
        }

        if (verseCount <= 6) return 1;
        if (verseCount <= 15) return 2;
        return 3;
    }
}
